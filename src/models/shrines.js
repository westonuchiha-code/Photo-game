// Two small roadside shrines from the shrine photos.
//  makeStatueShrine(): low red wooden shelter with a plank roof on a concrete platform; red
//    picket fence round the back and sides; stone statues wearing flowered bibs, two little
//    stone lanterns, offering cups; a carved relief tablet on a pedestal outside.
//  makeStoneShrine(): red gabled shelter with pointed pickets around a tall standing stone,
//    a hanging bell with a striped cloth streamer, flowers and a cup, a white signboard and
//    a small square stone marker in front. All writing is made up.
// Both face +z, origin at the front-centre of the ground pad.
import * as THREE from 'three';

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, ...o });
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
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};

let M = null;
function mats() {
  if (M) return M;
  M = {};
  M.red = std({ map: ptex('shr_redwood.png', 1, 1) });                  // vertical boards / posts
  M.redH = std({ map: ptex('shr_redwood.png', 1, 1) });                 // horizontal members (rotated map)
  M.redH.map.rotation = Math.PI / 2; M.redH.map.center.set(0.5, 0.5);
  M.roof = std({ map: ptex('shr_roof.png', 1, 1), side: THREE.DoubleSide });
  M.roofUnder = std({ color: '#5a2a22' });
  M.stone = std({ map: ptex('shr_stone.png', 1, 1), roughness: 0.95 });
  M.stone2 = std({ map: ptex('shr_stone.png', 2, 1), color: '#c9c4b8', roughness: 0.95 });
  M.concrete = std({ map: ptex('shr_concrete.png', 1, 1), roughness: 0.95 });
  M.concTop = std({ map: ptex('shr_stone.png', 3, 2), color: '#b5b09f', roughness: 0.95 });
  M.bib = std({ map: ptex('shr_bib.png'), side: THREE.DoubleSide, roughness: 0.9 });
  M.tablet = std({ map: ptex('shr_tablet.png'), roughness: 0.95 });
  M.metal = std({ color: '#8f8a80', metalness: 0.5, roughness: 0.6 });
  return M;
}

// ---------------------------------------------------------------- shared bits
function fencePanel(len, h, pointed, seed) {
  // pickets on two rails, set along x, centred
  const g = new THREE.Group();
  const r = rng(seed);
  const pw = pointed ? 0.11 : 0.075, gap = pointed ? 0.035 : 0.03;
  const n = Math.floor(len / (pw + gap));
  const top = pointed ? new THREE.ConeGeometry(pw * 0.72, 0.1, 4, 1) : new THREE.CylinderGeometry(pw / 2, pw / 2, 0.025, 10, 1, false, 0, Math.PI);
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + (i + 0.5) * (pw + gap);
    const ph = h - 0.03 + (r() - 0.5) * 0.04;
    const p = box(pw, ph, 0.018, M.red, x, ph / 2, 0);
    g.add(p);
    const t = new THREE.Mesh(top, M.red);
    if (pointed) { t.rotation.y = Math.PI / 4; t.scale.z = 0.18; t.position.set(x, ph + 0.05, 0); }
    else { t.rotation.x = Math.PI / 2; t.rotation.z = Math.PI / 2; t.position.set(x, ph, 0); }
    g.add(t);
  }
  for (const y of [0.18, h - 0.22]) g.add(box(len, 0.06, 0.03, M.redH, 0, y, -0.025));
  return g;
}
function jizo(h, seed) {
  // small stone figure: rounded robe body + round head, flowered bib tied at the neck
  const g = new THREE.Group();
  const r = rng(seed);
  const pts = [[0, 0], [h * 0.2, 0], [h * 0.21, h * 0.25], [h * 0.19, h * 0.55], [h * 0.14, h * 0.7], [h * 0.09, h * 0.74], [0, h * 0.75]].map(([a, b]) => new THREE.Vector2(a, b));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 18), M.stone);
  body.scale.z = 0.8;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(h * 0.13, 16, 12), M.stone);
  head.position.y = h * 0.83; head.scale.set(1, 1.1, 0.95);
  head.castShadow = true;
  g.add(head);
  // bib: a slightly curved cloth hanging from the neck down the chest
  const bg = new THREE.PlaneGeometry(h * 0.36, h * 0.48, 6, 6);
  const p = bg.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, -x * x * 3.2 / h); }
  bg.computeVertexNormals();
  const bib = new THREE.Mesh(bg, M.bib);
  bib.position.set(0, h * 0.47, h * 0.175 + r() * 0.005);
  bib.rotation.x = 0.12;
  g.add(bib);
  return g;
}
function lantern(seed) {
  // little stone lantern box with an arched niche (photo: two either side of the altar)
  const g = new THREE.Group();
  g.add(box(0.26, 0.05, 0.24, M.stone2, 0, 0.025, 0));
  const body = box(0.22, 0.26, 0.2, M.stone, 0, 0.18, 0);
  g.add(body);
  const niche = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.13), std({ color: '#141210' }));
  niche.position.set(0, 0.17, 0.101);
  g.add(niche);
  const arch = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12, 0, Math.PI), std({ color: '#141210' }));
  arch.position.set(0, 0.235, 0.101);
  g.add(arch);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.08, 4), M.stone2);
  cap.rotation.y = Math.PI / 4; cap.scale.z = 0.85; cap.position.y = 0.35;
  g.add(cap);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M.stone2); knob.position.y = 0.41; g.add(knob);
  return g;
}
function cup(x, y, z, tea = true) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.024, 0.045, 12, 1, true), std({ color: '#f2f0ea', side: THREE.DoubleSide, roughness: 0.3 }));
  c.position.y = 0.0225; g.add(c);
  if (tea) { const t = new THREE.Mesh(new THREE.CircleGeometry(0.028, 12), std({ color: '#b8742a', roughness: 0.1 })); t.rotation.x = -Math.PI / 2; t.position.y = 0.035; g.add(t); }
  g.position.set(x, y, z);
  return g;
}

// ---------------------------------------------------------------- statue shrine
export function makeStatueShrine() {
  mats();
  const g = new THREE.Group();
  const colliders = [];
  const W = 2.5, D = 1.7, H = 1.95;
  // ground pad + front step + raised platform (photo: two concrete slabs)
  const pad = box(W + 0.8, 0.12, 0.7, M.concrete, 0, 0.06, -0.35); g.add(pad);
  for (let i = 0; i < 3; i++) g.add(box(0.9, 0.1, 0.45, M.concTop, -0.95 + i * 0.95 + (i - 1) * 0.02, 0.05, 0.2));
  const plat = box(W + 0.1, 0.38, D, M.concrete, 0, 0.19, -0.7 - D / 2);
  g.add(plat);
  const platTop = box(W + 0.08, 0.02, D - 0.02, M.concTop, 0, 0.39, -0.7 - D / 2); g.add(platTop);
  const zc = -0.7 - D / 2;   // centre of the shelter
  // altar tiers inside
  g.add(box(1.7, 0.12, 0.7, M.concTop, 0, 0.45, zc - 0.35));
  g.add(box(1.2, 0.12, 0.45, M.concTop, 0, 0.57, zc - 0.5));
  // posts + beams
  const py = 0.4;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const post = box(0.09, H - py, 0.09, M.red, sx * (W / 2 - 0.05), py + (H - py) / 2, zc + sz * (D / 2 - 0.05));
    g.add(post);
    g.add(box(0.11, 0.08, 0.11, M.metal, post.position.x, py + 0.04, post.position.z));   // metal shoe at the foot
  }
  g.add(box(W + 0.1, 0.12, 0.08, M.redH, 0, H - 0.25, zc + D / 2 - 0.05));   // front tie beam
  g.add(box(W + 0.1, 0.12, 0.08, M.redH, 0, H - 0.25, zc - D / 2 + 0.05));
  for (const sx of [-1, 1]) g.add(box(0.08, 0.12, D, M.redH, sx * (W / 2 - 0.05), H - 0.25, zc));
  g.add(box(W + 0.1, 0.06, 0.06, M.redH, 0, H - 0.08, zc + D / 2 - 0.05));
  // low-pitched gable roof of weathered planks, metal ridge cap, wide eaves
  const RW = W + 0.9, RD = D + 0.9, pitch = 0.09;
  for (const s of [-1, 1]) {
    const half = box(RW, 0.04, RD / 2 + 0.02, M.roof, 0, H + 0.08 + RD / 4 * Math.sin(pitch), zc + s * RD / 4);
    half.rotation.x = s * pitch;
    g.add(half);
    const fascia = box(RW, 0.1, 0.03, M.redH, 0, H + 0.04, zc + s * (RD / 2));
    g.add(fascia);
  }
  for (const sx of [-1, 1]) g.add(box(0.03, 0.12, RD, M.redH, sx * RW / 2, H + 0.06, zc));
  g.add(box(RW + 0.04, 0.035, 0.12, std({ color: '#9a9c99', metalness: 0.6, roughness: 0.45 }), 0, H + 0.13 + RD / 4 * Math.sin(pitch) + 0.01, zc));
  // fence: back + both sides (rounded-top pickets)
  const back = fencePanel(W - 0.12, 1.05, false, 3); back.position.set(0, py, zc - D / 2 + 0.07); g.add(back);
  for (const sx of [-1, 1]) {
    const side = fencePanel(D - 0.2, 1.05, false, 5 + sx); side.rotation.y = Math.PI / 2; side.position.set(sx * (W / 2 - 0.07), py, zc); g.add(side);
    g.add(box(0.05, 0.05, D, M.redH, sx * (W / 2 - 0.07), py + 0.62, zc));   // the slanted side rail in the photo
  }
  // statues: tall centre figure on stacked bases + lotus seat, two smaller with bibs
  const baseY = 0.63;
  g.add(box(0.36, 0.26, 0.32, M.stone2, 0, baseY + 0.13, zc - 0.5));
  g.add(box(0.3, 0.2, 0.28, M.stone2, 0, baseY + 0.36, zc - 0.5));
  const lotus = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.12, 16), M.stone); lotus.position.set(0, baseY + 0.52, zc - 0.5); g.add(lotus);
  const j1 = jizo(0.78, 1); j1.position.set(0, baseY + 0.58, zc - 0.5); g.add(j1);
  const j2 = jizo(0.55, 2); j2.position.set(0.55, 0.51, zc - 0.3); j2.rotation.y = -0.15; g.add(j2);
  // pointed stone tablet figure on the left with a bib
  const tab = new THREE.Group();
  const shape = new THREE.Shape(); shape.moveTo(-0.14, 0); shape.lineTo(0.14, 0); shape.lineTo(0.14, 0.4); shape.quadraticCurveTo(0.12, 0.56, 0, 0.62); shape.quadraticCurveTo(-0.12, 0.56, -0.14, 0.4); shape.lineTo(-0.14, 0);
  const tg = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 });
  const tm = new THREE.Mesh(tg, M.stone); tm.castShadow = true; tab.add(tm);
  const tb = jizo(0.4, 4).children[2]; tb.position.set(0, 0.25, 0.13); tb.scale.set(1.1, 0.9, 1); tab.add(tb);
  tab.position.set(-0.55, 0.51, zc - 0.45); tab.scale.setScalar(1.25); g.add(tab);
  const tufts = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 6, 1, true), std({ color: '#557a3a', side: THREE.DoubleSide })); tufts.position.set(-0.85, 0.62, zc - 0.55); g.add(tufts);
  // lanterns + cups
  const l1 = lantern(1); l1.position.set(-0.6, 0.51, zc + 0.05); g.add(l1);
  const l2 = lantern(2); l2.position.set(0.62, 0.51, zc + 0.05); g.add(l2);
  g.add(box(0.2, 0.16, 0.18, M.stone2, 0.0, 0.48, zc + 0.05));       // small offering block
  g.add(cup(-0.05, 0.56, zc + 0.05), cup(0.06, 0.56, zc + 0.08));
  g.add(cup(0.1, 0.69, zc - 0.3, true), cup(-0.1, 0.69, zc - 0.3, false));
  // relief tablet on a pedestal outside to the right (photo)
  const ped = box(0.42, 0.34, 0.36, M.stone2, W / 2 + 0.75, 0.17, zc + 0.3); g.add(ped);
  const rel = new THREE.Group();
  const rs = new THREE.Shape(); rs.moveTo(-0.15, 0); rs.lineTo(0.15, 0); rs.lineTo(0.15, 0.5); rs.lineTo(0, 0.66); rs.lineTo(-0.15, 0.5); rs.lineTo(-0.15, 0);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: 0.1, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1 });
  rel.add(new THREE.Mesh(rg, M.stone));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), M.tablet);
  face.position.set(0, 0.32, 0.113); rel.add(face);
  rel.position.set(W / 2 + 0.75, 0.34, zc + 0.25);
  rel.rotation.y = -0.2;
  g.add(rel);
  g.add(cup(W / 2 + 0.88, 0.34, zc + 0.42));
  // a few round stones at the edge of the platform
  const r = rng(9);
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06 + r() * 0.06, 0), M.stone2);
    s.position.set(W / 2 + 0.35 + r() * 0.6, 0.04, zc + 0.9 - r() * 1.6); s.rotation.set(r() * 3, r() * 3, 0); g.add(s);
  }
  colliders.push([-W / 2 - 0.1, W / 2 + 0.1, zc - D / 2 - 0.1, zc + D / 2 + 0.05]);
  colliders.push([W / 2 + 0.5, W / 2 + 1.0, zc + 0.1, zc + 0.5]);
  g.userData.colliders = colliders;
  return g;
}

// ---------------------------------------------------------------- standing-stone shrine
export function makeStoneShrine() {
  mats();
  const g = new THREE.Group();
  const colliders = [];
  const W = 2.2, D = 1.5, H = 2.0, zc = -1.1;
  // packed-earth / concrete pad
  const pad = box(W + 1.2, 0.04, D + 1.6, std({ map: ptex('shr_concrete.png', 1, 3), color: '#9a958a' }), 0, 0.02, zc + 0.3); g.add(pad);
  // posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.1, H, 0.1, M.red, sx * W / 2, H / 2, zc + sz * D / 2));
  // tie beams front/back + sides, centre post up to the ridge
  for (const sz of [-1, 1]) {
    g.add(box(W + 0.3, 0.12, 0.09, M.redH, 0, H - 0.06, zc + sz * D / 2));
    g.add(box(W + 0.1, 0.08, 0.07, M.redH, 0, H - 0.42, zc + sz * D / 2));
  }
  for (const sx of [-1, 1]) g.add(box(0.09, 0.12, D + 0.2, M.redH, sx * W / 2, H - 0.06, zc));
  const RISE = 0.62, RW = W + 1.0, RD = D + 0.9;
  g.add(box(0.09, RISE, 0.09, M.red, 0, H + RISE / 2, zc + D / 2));      // king post in the gable
  g.add(box(0.09, RISE, 0.09, M.red, 0, H + RISE / 2, zc - D / 2));
  // gabled roof: ridge runs front-to-back (gable faces the path like the photo)
  const slope = Math.atan2(RISE, RW / 2);
  const sl = Math.hypot(RISE, RW / 2) + 0.06;
  for (const s of [-1, 1]) {
    const half = new THREE.Group();
    half.add(box(sl, 0.04, RD, M.roofUnder, 0, 0, 0));
    half.add(box(sl, 0.012, RD, std({ map: ptex('shr_redwood.png', 4, 1), color: '#d07a6e' }), 0, 0.026, 0));
    half.position.set(s * RW / 4, H + RISE / 2 + 0.04, zc);
    half.rotation.z = -s * slope;
    g.add(half);
    // white-weathered barge boards on the gable ends
    for (const ez of [-1, 1]) {
      const bb = box(sl + 0.04, 0.14, 0.04, M.redH, s * RW / 4, H + RISE / 2 + 0.0, zc + ez * RD / 2);
      bb.rotation.z = -s * slope;
      g.add(bb);
    }
    // rafters visible underneath
    for (let k = -2; k <= 2; k++) {
      const rf = box(sl - 0.1, 0.05, 0.05, M.redH, s * RW / 4, H + RISE / 2 - 0.05, zc + k * RD / 5);
      rf.rotation.z = -s * slope; g.add(rf);
    }
  }
  g.add(box(0.08, 0.06, RD + 0.1, M.metal, 0, H + RISE + 0.06, zc));
  const fin = box(0.12, 0.22, 0.06, M.red, 0, H + RISE + 0.12, zc + RD / 2 + 0.02); g.add(fin);   // little finial at the peak
  // pointed picket fence round back + sides
  const back = fencePanel(W - 0.1, 1.25, true, 11); back.position.set(0, 0, zc - D / 2 + 0.06); g.add(back);
  for (const sx of [-1, 1]) {
    const side = fencePanel(D - 0.12, 1.25, true, 12 + sx); side.rotation.y = Math.PI / 2; side.position.set(sx * (W / 2 - 0.06), 0, zc); g.add(side);
  }
  // standing stone on a base slab
  g.add(box(0.75, 0.22, 0.6, M.stone2, 0, 0.11, zc - 0.15));
  const pts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; const y = t * 1.45; const w = 0.27 * Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, t - 0.55) / 0.45, 2))) + 0.02 * (1 - t); pts.push(new THREE.Vector2(Math.max(0.005, w * (1 - 0.15 * t)), y)); }
  const sg = new THREE.LatheGeometry(pts, 20);
  const sp = sg.attributes.position, r = rng(31);
  for (let i = 0; i < sp.count; i++) {
    const y = sp.getY(i), ang = Math.atan2(sp.getZ(i), sp.getX(i));
    const k = 1 + 0.06 * Math.sin(ang * 3 + y * 4) + 0.04 * Math.sin(ang * 7 - y * 9);
    sp.setXYZ(i, sp.getX(i) * k * 1.15, y, sp.getZ(i) * k * 0.7);
  }
  sg.computeVertexNormals();
  const st = new THREE.Mesh(sg, M.stone);
  st.material = M.stone.clone(); st.material.map = M.stone.map.clone(); st.material.map.repeat.set(2, 2); st.material.map.needsUpdate = true;
  st.position.set(0, 0.22, zc - 0.18); st.rotation.y = 0.15; st.castShadow = true;
  g.add(st);
  // bell + striped cloth streamer hanging from the front beam
  const bellY = H - 0.18;
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 6), std({ color: '#d93a2c' })); rope.position.set(0, bellY - 0.12, zc + D / 2 - 0.04); g.add(rope);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), std({ color: '#b8923a', metalness: 0.8, roughness: 0.35 }));
  bell.position.set(0, bellY - 0.28, zc + D / 2 - 0.04); bell.scale.y = 0.85; g.add(bell);
  for (const dx of [-0.11, 0.11]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), std({ color: '#d42a2a', roughness: 0.4 })); b.position.set(dx, bellY - 0.05, zc + D / 2 - 0.04); g.add(b); }
  const clothTex = canvasTex(64, 512, (x, w, h) => {
    x.fillStyle = '#f4f2ec'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#d42a2a'; x.fillRect(w * 0.55, 0, w * 0.45, h);
    x.strokeStyle = '#1b1b1b'; x.lineWidth = 4; x.lineCap = 'round';
    const rr = rng(5);                      // abstract brush marks, no real writing
    for (let i = 0; i < 9; i++) { const y = 30 + i * 52; x.beginPath(); x.moveTo(8 + rr() * 8, y); x.quadraticCurveTo(20 + rr() * 10, y + 10 + rr() * 10, 10 + rr() * 16, y + 26 + rr() * 10); x.stroke(); }
  });
  const cloth = new THREE.PlaneGeometry(0.12, 1.15, 1, 10);
  const cp = cloth.attributes.position;
  for (let i = 0; i < cp.count; i++) { const y = cp.getY(i); cp.setZ(i, Math.sin(y * 3) * 0.03); cp.setX(i, cp.getX(i) + Math.sin(y * 2.2) * 0.02); }
  cloth.computeVertexNormals();
  const cm = new THREE.Mesh(cloth, std({ map: clothTex, side: THREE.DoubleSide, roughness: 0.9 }));
  cm.position.set(0.02, bellY - 0.38 - 0.575, zc + D / 2 - 0.03);
  g.add(cm);
  // flowers in a bamboo tube + cup on the slab
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 10), std({ color: '#c9b27a' })); tube.position.set(0.22, 0.33, zc + 0.08); g.add(tube);
  const fr = rng(14);
  for (let i = 0; i < 9; i++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.25, 4), std({ color: '#3f7a2a' }));
    const a = fr() * Math.PI * 2, tilt = 0.25 + fr() * 0.3;
    stem.position.set(0.22 + Math.cos(a) * 0.05, 0.52, zc + 0.08 + Math.sin(a) * 0.05); stem.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt); g.add(stem);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), std({ color: ['#3d5fd8', '#f2d43a', '#f4f2ea', '#8a6ad8'][i % 4], roughness: 0.7 }));
    fl.position.set(0.22 + Math.cos(a) * 0.12, 0.64, zc + 0.08 + Math.sin(a) * 0.12); g.add(fl);
  }
  g.add(cup(-0.05, 0.22, zc + 0.12, false));
  // white signboard (house-shaped top) on the fence, made-up text
  const sign = canvasTex(256, 320, (x, w, h) => {
    x.fillStyle = '#f6f6f2'; x.beginPath(); x.moveTo(0, 60); x.lineTo(w / 2, 0); x.lineTo(w, 60); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
    x.fillStyle = '#222'; x.font = 'bold 30px Georgia'; x.textAlign = 'center';
    ['OLD STONE', 'OF THE', 'HILL PATH'].forEach((t, i) => x.fillText(t, w / 2, 110 + i * 40));
    x.font = 'italic 20px Georgia'; ['please leave', 'flowers only'].forEach((t, i) => x.fillText(t, w / 2, 250 + i * 26));
  });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.4), std({ map: sign, transparent: true, alphaTest: 0.5, roughness: 0.4 }));
  sm.position.set(0.58, 0.95, zc - D / 2 + 0.11); g.add(sm);
  // square stone marker post out front, carved with made-up lettering
  const carve = canvasTex(64, 256, (x, w, h) => {
    x.fillStyle = '#8f8b82'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#4b4842'; x.font = 'bold 34px Georgia'; x.textAlign = 'center';
    'PEACE'.split('').forEach((c, i) => x.fillText(c, w / 2, 44 + i * 44));
  });
  const carveM = std({ map: carve, roughness: 0.95 });
  const mk = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 0.22), [M.stone, M.stone, M.stone, M.stone, carveM, M.stone]);
  mk.position.set(0, 0.425, zc + D / 2 + 0.75); mk.castShadow = true; g.add(mk);
  const mtop = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.155, 0.06, 4), M.stone); mtop.rotation.y = Math.PI / 4; mtop.position.set(0, 0.88, zc + D / 2 + 0.75); g.add(mtop);
  g.add(box(0.55, 0.06, 0.4, M.stone2, 0, 0.03, zc + D / 2 + 0.75));
  colliders.push([-W / 2 - 0.1, W / 2 + 0.1, zc - D / 2 - 0.1, zc + D / 2 + 0.05]);
  colliders.push([-0.15, 0.15, zc + D / 2 + 0.6, zc + D / 2 + 0.9]);
  g.userData.colliders = colliders;
  return g;
}
