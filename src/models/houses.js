// House fronts from the misc door photos: a short row of small houses, each built around
// one of the photographed entries. Every house faces +z (local), origin at the centre of the
// front wall at ground level. House numbers and any lettering are made up.
//   'brick'   red brick, brown six-panel door, white trim, wood deck stoop, beige siding beside
//   'yellow'  yellow brick, red door with a nine-lite window, wreath + hanging welcome sign,
//             carriage lamps, red shutters, concrete steps with an iron rail
//   'gray'    gray lap siding, white six-panel door with a glass sidelight, house-number tag,
//             black wall lantern, door mat on a concrete stoop
//   'stone'   stone-veneer wall, black door behind a full-glass storm door with a wreath, potted plants
//   'porch'   covered front porch: white posts + railing, stone pier bases, gray siding, red door,
//             a flag on a bracket, wide concrete steps
//   'tan'     tan siding, white storm door with a glass panel, wall-mounted hose reel, big numbers
import * as THREE from 'three';
import { makePlasticBag, makePaperBag, makeCup, makeTote, makeTrashBag, makeDeliBox, makeSoilBag, makeSodaBottle } from './delivery.js';

const _L = new THREE.TextureLoader();
const texCache = {};
function ptex(name) {
  if (!texCache[name]) {
    const t = _L.load(`assets/textures/${name}`);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    texCache[name] = t;
  }
  return texCache[name];
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
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, ...o });
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
// a wall panel (in the xy plane, facing +z) whose texture repeats every unitU x unitV metres
function wall(w, h, texName, unitU, unitV, color = '#ffffff') {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / unitU, uv.getY(i) * h / unitV);
  const m = new THREE.Mesh(g, std({ map: ptex(texName), color, roughness: 0.9 }));
  m.receiveShadow = true;
  return m;
}
const WALLS = {
  brick: ['hs_brick.png', 0.5, 2.0],
  ybrick: ['hs_ybrick.png', 0.45, 1.6],
  stone: ['hs_stone.png', 0.9, 1.8],
  siding: ['hs_siding.png', 0.9, 1.6],
};

// ---------------------------------------------------------------- doors
const DW = 0.92, DH = 2.04;
function sixPanel(color, { lites = false } = {}) {
  const g = new THREE.Group();
  const m = std({ color, roughness: 0.45 });
  const inset = std({ color: new THREE.Color(color).multiplyScalar(0.88), roughness: 0.5 });
  g.add(box(DW, DH, 0.045, m, 0, DH / 2, 0));
  const pw = DW / 2 - 0.13;
  const rows = lites ? [[0.45, 0.62]] : [[1.66, 0.42], [1.08, 0.6], [0.42, 0.56]];
  for (const sx of [-1, 1]) for (const [y, ph] of rows) {
    g.add(box(pw, ph, 0.012, inset, sx * (pw / 2 + 0.045), y, 0.027));
    g.add(box(pw - 0.05, ph - 0.05, 0.014, m, sx * (pw / 2 + 0.045), y, 0.03));
  }
  if (lites) {     // nine-lite window in the top half
    const glass = std({ color: '#1d2730', roughness: 0.1, metalness: 0.3, emissive: '#3a3020' });
    g.add(box(DW - 0.24, 0.92, 0.05, glass, 0, 1.45, 0.005));
    for (const x of [-0.115, 0.115]) g.add(box(0.03, 0.92, 0.06, m, x, 1.45, 0.01));
    for (const y of [1.15, 1.75]) g.add(box(DW - 0.24, 0.03, 0.06, m, 0, y, 0.01));
  }
  // deadbolt + lever handle (black, like the photos)
  const blk = std({ color: '#1d1d1f', roughness: 0.35, metalness: 0.5 });
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 14), blk);
  rose.rotation.x = Math.PI / 2; rose.position.set(DW / 2 - 0.09, 0.95, 0.04); g.add(rose);
  const lever = box(0.11, 0.02, 0.02, blk, DW / 2 - 0.13, 0.95, 0.065); g.add(lever);
  const db = rose.clone(); db.position.y = 1.12; g.add(db);
  return g;
}
function stormDoor(color, wreath) {     // full-glass storm door in front of the main door
  const g = new THREE.Group();
  const fr = std({ color, roughness: 0.4 });
  const glass = new THREE.MeshStandardMaterial({ color: '#9fb0ba', transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.4 });
  for (const sx of [-1, 1]) g.add(box(0.07, DH, 0.04, fr, sx * (DW / 2 - 0.035), DH / 2, 0));
  g.add(box(DW, 0.08, 0.04, fr, 0, DH - 0.04, 0), box(DW, 0.22, 0.04, fr, 0, 0.11, 0), box(DW, 0.05, 0.04, fr, 0, 0.98, 0));
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(DW - 0.14, DH - 0.32), glass); gp.position.set(0, DH / 2 + 0.05, 0); g.add(gp);
  const h = box(0.025, 0.16, 0.03, std({ color: '#c9ccd0', metalness: 0.7, roughness: 0.3 }), DW / 2 - 0.1, 0.98, 0.04); g.add(h);
  if (wreath) g.add(makeWreath(wreath, 0, 1.55, 0.04));
  return g;
}
function makeWreath(style, x, y, z) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 24), std({ color: style === 'autumn' ? '#8a5a2a' : '#4d6a3a', roughness: 1 }));
  g.add(ring);
  const cols = style === 'autumn' ? ['#d8732a', '#b8402a', '#e8b84a', '#7a3a2a'] : ['#f2b8c8', '#e88aa8', '#f6f0e8', '#c9e0f0'];
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (i % 3) * 0.008, 8, 6), std({ color: cols[i % cols.length], roughness: 0.9 }));
    f.position.set(Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0.04); g.add(f);
  }
  g.position.set(x, y, z);
  return g;
}
function porchLight(x, y, z, style = 'lantern') {
  const g = new THREE.Group();
  const blk = std({ color: '#1f2022', roughness: 0.4, metalness: 0.5 });
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.6, 1.05), toneMapped: false });
  g.add(box(0.1, 0.18, 0.03, blk, 0, 0, 0));
  if (style === 'lantern') {
    g.add(box(0.14, 0.22, 0.14, blk, 0, 0.02, 0.1));
    g.add(box(0.11, 0.18, 0.11, glow, 0, 0.02, 0.1));
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.08, 4), blk); cap.rotation.y = Math.PI / 4; cap.position.set(0, 0.17, 0.1); g.add(cap);
  } else {       // carriage lamp with a clear globe (yellow-brick photo)
    const arm = box(0.03, 0.03, 0.12, blk, 0, -0.02, 0.06); g.add(arm);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), glow); globe.position.set(0, 0.04, 0.13); g.add(globe);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.04, 12), blk); cap.position.set(0, 0.13, 0.13); g.add(cap);
  }
  g.position.set(x, y, z);
  return g;
}
function numberTag(text, bg, fg, w, h) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ roughness: 0.5, map: canvasTex(256, Math.round(256 * h / w), (x, cw, ch) => {
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, cw, ch); }
    x.fillStyle = fg; x.font = `600 ${Math.round(ch * 0.7)}px "Oswald"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, cw / 2, ch / 2 + 2);
  }), transparent: !bg }));
}
function doorbell(x, y) {
  const g = new THREE.Group();
  g.add(box(0.05, 0.12, 0.025, std({ color: '#222326', roughness: 0.3 })));
  const b = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.4, 1.8), toneMapped: false }));
  b.position.set(0, -0.03, 0.013); g.add(b);
  g.position.set(x, y, 0.02);
  return g;
}
function doorMat(w, d, text) {
  const t = canvasTex(256, 128, (x, cw, ch) => {
    x.fillStyle = '#2b2622'; x.fillRect(0, 0, cw, ch);
    x.strokeStyle = '#3b342e'; x.lineWidth = 3; for (let i = 0; i < cw; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, ch); x.stroke(); }
    if (text) { x.fillStyle = '#b9b0a2'; x.font = '700 34px "Cinzel"'; x.textAlign = 'center'; x.fillText(text, cw / 2, ch / 2 + 12); }
  });
  const m = box(w, 0.015, d, std({ map: t, roughness: 1 }), 0, 0.0075, 0);
  return m;
}
function concrete(w, h, d, x, y, z) { return box(w, h, d, std({ color: '#b9b6ae', roughness: 0.95 }), x, y, z); }

// ---------------------------------------------------------------- house shell
function shell(g, W, D, H, frontKind, sideColor) {
  const [tn, uu, vv] = WALLS[frontKind];
  const f = wall(W, H, tn, uu, vv); f.position.set(0, H / 2, 0); g.add(f);
  const sideMat = ['hs_siding.png', 0.9, 1.6];
  for (const s of [-1, 1]) {
    const p = wall(D, H, sideMat[0], sideMat[1], sideMat[2], sideColor); p.position.set(s * W / 2, H / 2, -D / 2); p.rotation.y = s * Math.PI / 2; g.add(p);
  }
  const back = wall(W, H, sideMat[0], sideMat[1], sideMat[2], sideColor); back.position.set(0, H / 2, -D); back.rotation.y = Math.PI; g.add(back);
  // side-gable roof (ridge along x), asphalt shingles
  const shingle = std({ map: canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#3a3836'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) { x.fillStyle = `rgb(${50 + ((r * 7 + c * 13) % 20)},${48 + ((r * 5 + c * 11) % 18)},${46 + ((r * 3 + c * 7) % 16)})`; x.fillRect(c * 22 + (r % 2) * 11, r * 16, 20, 14); }
  }), roughness: 0.95 });
  shingle.map.wrapS = shingle.map.wrapT = THREE.RepeatWrapping; shingle.map.repeat.set(W / 1.2, 3);
  const rise = 1.6, half = D / 2 + 0.35, sl = Math.hypot(rise, half);
  for (const s of [-1, 1]) {
    const r = box(W + 0.5, 0.06, sl, shingle, 0, H + rise / 2, -D / 2 + s * half / 2);
    r.rotation.x = s * Math.atan2(rise, half);
    g.add(r);
  }
  for (const s of [-1, 1]) {    // gable ends
    const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, rise); sh.lineTo(-D / 2, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), std({ color: sideColor, side: THREE.DoubleSide }));
    m.rotation.y = Math.PI / 2; m.position.set(s * W / 2, H, -D / 2); g.add(m);
  }
  g.add(box(W + 0.5, 0.18, 0.05, std({ color: '#f2f0ea' }), 0, H - 0.05, 0.36));   // fascia
}
function windowUnit(w, h, x, y, shutters = null) {
  const g = new THREE.Group();
  const trim = std({ color: '#f2f0ea', roughness: 0.5 });
  const glass = std({ color: '#262f38', roughness: 0.08, metalness: 0.3, emissive: '#2a2416' });
  g.add(box(w, h, 0.04, glass, 0, 0, 0));
  g.add(box(w + 0.12, 0.08, 0.08, trim, 0, h / 2 + 0.04, 0.02), box(w + 0.16, 0.06, 0.12, trim, 0, -h / 2 - 0.03, 0.03));
  for (const s of [-1, 1]) g.add(box(0.06, h, 0.07, trim, s * (w / 2 + 0.03), 0, 0.02));
  g.add(box(w, 0.04, 0.06, trim, 0, 0, 0.02), box(0.03, h, 0.05, trim, 0, 0, 0.02));
  if (shutters) for (const s of [-1, 1]) {
    const sh = box(w * 0.45, h + 0.05, 0.03, std({ color: shutters, roughness: 0.6 }), s * (w / 2 + w * 0.25 + 0.06), 0, 0.03);
    g.add(sh);
    for (let k = 0; k < 9; k++) g.add(box(w * 0.4, 0.012, 0.02, std({ color: new THREE.Color(shutters).multiplyScalar(0.7) }), s * (w / 2 + w * 0.25 + 0.06), -h / 2 + 0.1 + k * (h - 0.2) / 8, 0.05));
  }
  g.position.set(x, y, 0.02);
  return g;
}

// ---------------------------------------------------------------- the houses
export function makeHouse(kind, W = 4.2) {
  const g = new THREE.Group();
  const D = 3.6, H = 4.6;
  const colliders = [[-W / 2, W / 2, -D, 0.05]];
  const lights = [];
  const trim = std({ color: '#f2f0ea', roughness: 0.5 });
  let FL = 0;     // floor height at the door
  const surround = (x, y0, w = DW, h = DH, depth = 0.12) => {
    for (const s of [-1, 1]) g.add(box(0.12, h + 0.12, depth, trim, x + s * (w / 2 + 0.06), y0 + (h + 0.12) / 2, depth / 2));
    g.add(box(w + 0.36, 0.14, depth + 0.02, trim, x, y0 + h + 0.13, depth / 2));
  };
  if (kind === 'brick') {
    shell(g, W, D, H, 'brick', '#d8cfbc');
    FL = 0.18;
    const deck = box(1.9, FL, 1.4, std({ map: ptex('hs_deck.png'), roughness: 0.85 }), -0.2, FL / 2, 0.7);
    deck.material.map.repeat.set(1.2, 1); g.add(deck);
    const d = sixPanel('#8a4a3e'); d.position.set(-0.2, FL, 0.03); g.add(d);
    surround(-0.2, FL);
    // a strip of beige siding beside the brick (photo right edge)
    const sd = wall(0.9, H, 'hs_siding.png', 0.9, 1.6, '#e8dcc0'); sd.position.set(W / 2 - 0.45, H / 2, 0.01); g.add(sd);
    g.add(box(0.06, H, 0.06, trim, W / 2 - 0.92, H / 2, 0.03));
    g.add(porchLight(-1.05, FL + 1.75, 0.02));
    g.add(doorbell(0.42, FL + 1.1));
    g.add(windowUnit(1.1, 1.3, 1.0, 2.9));
    lights.push([-1.05, FL + 1.75, 0.5]);
    colliders.push([-1.15, 0.75, 0, 1.4]);
  } else if (kind === 'yellow') {
    shell(g, W, D, H, 'ybrick', '#e6d8b4');
    FL = 0.36;
    for (let i = 0; i < 2; i++) g.add(concrete(1.7 - i * 0.2, 0.18, 1.3 - i * 0.45, 0, 0.09 + i * 0.18, 0.65 - i * 0.22));
    const d = sixPanel('#b5352d', { lites: true }); d.position.set(0, FL, 0.03); g.add(d);
    surround(0, FL);
    g.add(makeWreath('autumn', 0, FL + 1.5, 0.11));
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.12), std({ map: canvasTex(256, 72, (x, w, h) => { x.fillStyle = '#f4efe2'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2a2a'; x.font = '40px "Pacifico"'; x.textAlign = 'center'; x.fillText('Welcome', w / 2, 50); }) }));
    sign.position.set(0, FL + 0.95, 0.09); g.add(sign);
    for (const s of [-1, 1]) g.add(porchLight(s * 0.85, FL + 1.75, 0.02, 'carriage'));
    lights.push([0, FL + 1.8, 0.6]);
    g.add(windowUnit(0.9, 1.25, 1.55, 1.9, '#a8322c'));
    const num = numberTag('153', null, '#1d1d1f', 0.3, 0.12); num.position.set(-1.3, FL + 1.6, 0.03); g.add(num);
    // iron hand rail down the steps
    const iron = std({ color: '#151516', roughness: 0.4, metalness: 0.6 });
    g.add(box(0.03, 0.03, 1.0, iron, 0.95, FL + 0.55, 0.75).rotateX(0.32));
    for (const z of [0.3, 1.2]) g.add(box(0.03, z < 1 ? 0.95 : 0.7, 0.03, iron, 0.95, (z < 1 ? 0.95 : 0.7) / 2, z));
    colliders.push([-0.85, 0.85, 0, 1.3]);
  } else if (kind === 'gray') {
    shell(g, W, D, H, 'siding', '#c9cac8');
    FL = 0.12;
    g.add(concrete(1.6, FL, 1.2, -0.1, FL / 2, 0.6));
    const d = sixPanel('#f3f1ea'); d.position.set(-0.25, FL, 0.03); g.add(d);
    surround(-0.25, FL);
    // sidelight to the right (photo)
    const sl = box(0.26, DH, 0.03, std({ color: '#26303a', roughness: 0.1, emissive: '#2a2416' }), 0.52, FL + DH / 2, 0.03); g.add(sl);
    for (let k = 0; k < 4; k++) g.add(box(0.26, 0.025, 0.04, trim, 0.52, FL + 0.3 + k * 0.5, 0.04));
    for (const x of [0.37, 0.67]) g.add(box(0.05, DH + 0.1, 0.1, trim, x, FL + DH / 2, 0.05));
    const tag = numberTag('214', '#2d6b3f', '#e8e2c8', 0.34, 0.18); tag.position.set(-1.15, FL + 1.55, 0.02); g.add(tag);
    g.add(porchLight(-1.15, FL + 1.95, 0.02));
    lights.push([-1.15, FL + 1.95, 0.5]);
    g.add(doorbell(0.85, FL + 1.1));
    const mat = doorMat(0.9, 0.55, null); mat.position.set(-0.25, FL, 0.45); g.add(mat);
    g.add(windowUnit(1.0, 1.2, -1.2, 3.1));
    colliders.push([-0.9, 0.7, 0, 1.2]);
  } else if (kind === 'stone') {
    shell(g, W, D, H, 'siding', '#d9ccb2');
    // stone-veneer wall to the right of the door, up to the eave
    const st = wall(W / 2 - 0.2, H, 'hs_stone.png', 0.9, 1.8); st.position.set((W / 2 + 0.2) / 2 + 0.1, H / 2, 0.02); g.add(st);
    FL = 0.1;
    g.add(concrete(1.8, FL, 1.4, -0.3, FL / 2, 0.7));
    const d = sixPanel('#1e1f22'); d.position.set(-0.4, FL, 0.0); g.add(d);
    const sd = stormDoor('#1e1f22', 'spring'); sd.position.set(-0.4, FL, 0.1); g.add(sd);
    surround(-0.4, FL, DW, DH, 0.16);
    g.add(doorbell(0.22, FL + 1.1));
    lights.push([-1.2, 2.2, 0.6]);
    g.add(porchLight(-1.25, FL + 1.8, 0.02));
    // potted plants by the door (photo)
    for (const [x, z, h, c] of [[0.35, 0.35, 0.32, '#3d6b3a'], [0.62, 0.3, 0.22, '#5a8a3a']]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.22, 14), std({ color: '#2d3a3a', roughness: 0.6 })); pot.position.set(x, FL + 0.11, z); g.add(pot);
      const pl = new THREE.Mesh(new THREE.SphereGeometry(h * 0.6, 10, 8), std({ color: c, roughness: 1 })); pl.position.set(x, FL + 0.22 + h * 0.4, z); pl.scale.y = 1.3; g.add(pl);
    }
    colliders.push([-1.2, 0.8, 0, 1.4]);
  } else if (kind === 'porch') {
    shell(g, W, D, H, 'siding', '#5d6a78');
    const front = g.children[0]; front.material = front.material.clone(); front.material.color.set('#7c8a99');
    FL = 0.5;
    const PD = 1.9;
    g.add(concrete(W - 0.4, FL, PD, 0, FL / 2, PD / 2));                           // porch slab
    for (let i = 0; i < 3; i++) g.add(concrete(1.6, FL - i * 0.16, 0.32, -0.9, (FL - i * 0.16) / 2, PD + 0.16 + i * 0.32));
    const d = sixPanel('#b8302a'); d.position.set(0.3, FL, 0.03); g.add(d);
    surround(0.3, FL);
    g.add(windowUnit(1.1, 1.2, -1.15, FL + 1.25));
    // porch roof on two posts on stone piers, white railing
    const post = std({ color: '#f4f2ec', roughness: 0.5 });
    const roofY = FL + 2.6;
    for (const x of [-W / 2 + 0.35, W / 2 - 0.35]) {
      const pier = wall(0.4, 0.75, 'hs_stone.png', 0.9, 1.8); pier.position.set(x, FL + 0.375, PD - 0.08); g.add(pier);
      g.add(box(0.4, 0.75, 0.4, std({ map: ptex('hs_stone.png'), roughness: 0.9 }), x, FL + 0.375, PD - 0.28));
      g.add(box(0.16, roofY - FL - 0.75, 0.16, post, x, FL + 0.75 + (roofY - FL - 0.75) / 2, PD - 0.28));
    }
    g.add(box(W - 0.2, 0.25, 0.25, post, 0, roofY, PD - 0.28));
    const pr = box(W, 0.08, PD + 0.3, std({ color: '#3a3836', roughness: 0.95 }), 0, roofY + 0.3, PD / 2 - 0.05); pr.rotation.x = 0.22; g.add(pr);
    g.add(box(W - 0.1, 0.03, PD, std({ color: '#eceae4', emissive: '#1f1d18' }), 0, roofY + 0.1, PD / 2 - 0.1));
    // railing along the front (left of the steps) and the right side
    const railRun = (x0, x1, z) => {
      g.add(box(x1 - x0, 0.06, 0.08, post, (x0 + x1) / 2, FL + 0.9, z), box(x1 - x0, 0.05, 0.06, post, (x0 + x1) / 2, FL + 0.08, z));
      for (let x = x0 + 0.06; x < x1 - 0.03; x += 0.11) g.add(box(0.035, 0.82, 0.035, post, x, FL + 0.49, z));
    };
    railRun(-0.05, W / 2 - 0.55, PD - 0.28);
    // flag on a bracket off the left post (generic striped flag)
    const flagTex = canvasTex(192, 120, (x, w, h) => {
      for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#f4f2ee' : '#b8232f'; x.fillRect(0, i * h / 13, w, h / 13 + 1); }
      x.fillStyle = '#2a3a6a'; x.fillRect(0, 0, w * 0.42, h * 7 / 13);
      x.fillStyle = '#f4f2ee'; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { x.beginPath(); x.arc(7 + c * 13 + (r % 2) * 6, 7 + r * 12.5, 2.2, 0, 7); x.fill(); }
    });
    const fg = new THREE.PlaneGeometry(0.9, 0.55, 12, 4);
    const fp = fg.attributes.position;
    for (let i = 0; i < fp.count; i++) { const x = fp.getX(i) + 0.45; fp.setZ(i, Math.sin(x * 7) * 0.05 * x); fp.setY(i, fp.getY(i) - x * 0.25); }
    fg.computeVertexNormals();
    const flag = new THREE.Mesh(fg, std({ map: flagTex, side: THREE.DoubleSide, roughness: 0.9 }));
    const staff = new THREE.Group();
    staff.add(box(0.025, 0.025, 1.3, std({ color: '#c9b47a', metalness: 0.6, roughness: 0.4 }), 0, 0, 0.65));
    flag.position.set(0, -0.3, 0.75); flag.rotation.y = -Math.PI / 2; staff.add(flag);
    staff.position.set(-W / 2 + 0.35, roofY - 0.4, PD - 0.2); staff.rotation.x = -0.6; staff.rotation.y = 0.2;
    g.add(staff);
    g.add(porchLight(-0.5, FL + 1.85, 0.02));
    lights.push([0, roofY - 0.3, PD / 2]);
    const num = numberTag('3341', '#f2f0ea', '#222', 0.42, 0.14); num.position.set(0.3, FL + DH + 0.45, 0.02); g.add(num);
    colliders.push([-W / 2 + 0.1, W / 2 - 0.1, 0, PD - 0.1]);
    colliders.push([-W / 2 + 0.1, -1.75, PD - 0.4, PD + 1.2]);
    g.userData.porch = { x0: -1.7, x1: W / 2 - 0.15, z0: 0, z1: PD, steps: [-1.7, -0.1, PD, PD + 0.96] };
  } else if (kind === 'tan') {
    shell(g, W, D, H, 'siding', '#cdbb9a');
    const front = g.children[0]; front.material = front.material.clone(); front.material.color.set('#d8c4a0');
    FL = 0.1;
    g.add(concrete(1.6, FL, 1.3, -0.3, FL / 2, 0.65));
    const d = sixPanel('#efece4'); d.position.set(-0.4, FL, 0.0); g.add(d);
    const sd = stormDoor('#f3f1ea', null); sd.position.set(-0.4, FL, 0.1); g.add(sd);
    surround(-0.4, FL, DW, DH, 0.16);
    // a narrow glass panel beside it (photo: sidelight storm)
    g.add(box(0.36, DH, 0.03, std({ color: '#2a333c', roughness: 0.1 }), -1.3, FL + DH / 2, 0.03));
    g.add(box(0.46, DH + 0.1, 0.06, trim, -1.3, FL + DH / 2, 0.0).translateZ(-0.02));
    const num = numberTag('1840', null, '#f4f2ee', 0.7, 0.24); num.position.set(1.0, 2.7, 0.03); g.add(num);
    // wall-mounted hose reel
    const reel = new THREE.Group();
    const dk = std({ color: '#2a2b2d', roughness: 0.5 });
    reel.add(box(0.36, 0.42, 0.06, dk, 0, 0, 0));
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 8, 20), std({ color: '#3a4a3a', roughness: 0.6 })); hose.position.z = 0.08; reel.add(hose);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 18), dk); drum.rotation.x = Math.PI / 2; drum.position.z = 0.08; reel.add(drum);
    reel.position.set(1.15, 0.85, 0.05); g.add(reel);
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 20, Math.PI * 1.4), std({ color: '#3a4a3a' })); tail.rotation.x = -Math.PI / 2; tail.position.set(1.3, 0.03, 0.55); g.add(tail);
    g.add(porchLight(0.25, FL + 1.85, 0.02));
    lights.push([0.25, FL + 1.9, 0.5]);
    g.add(doorbell(0.25, FL + 1.1));
    const mat = doorMat(0.85, 0.5, null); mat.position.set(-0.4, FL, 0.5); g.add(mat);
    colliders.push([-1.1, 0.5, 0, 1.3]);
  }
  // deliveries left at the door (27b, from the same photos)
  const put = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); };
  if (kind === 'brick') { put(makePlasticBag({ logo: 'wings', seed: 3 }), 0.2, FL, 0.45, -0.2); put(makeSodaBottle(), 0.55, FL, 0.4); }
  if (kind === 'yellow') { put(makePaperBag({ seed: 4 }), -0.35, FL, 0.3, 0.1); put(makeCup('tumbler'), 0.2, FL, 0.25); }
  if (kind === 'gray') put(makePlasticBag({ withPaper: true, seed: 5 }), -0.25, FL + 0.015, 0.45, 0.3);
  if (kind === 'stone') { put(makePaperBag({ pattern: null, seed: 6 }), -1.05, FL, 0.5, 0.2); put(makeCup('fountain'), -0.72, FL, 0.6); put(makeSoilBag(), 0.25, 0, 1.75, 0.5); }
  if (kind === 'tan') { put(makeTote(), -0.95, FL, 0.42, 0.15); put(makePaperBag({ pattern: null, seed: 7 }), 0.1, FL, 0.35, -0.2); }
  if (kind === 'porch') { put(makeTrashBag(), -0.55, FL, 0.4); put(makeCup('smoothie'), -0.25, FL, 0.75); put(makeDeliBox(), 1.0, FL, 0.6, 0.1); }
  // put the real lights in
  for (const [x, y, z] of lights) { const l = new THREE.PointLight('#ffd9a8', 3.2, 6, 1.5); l.position.set(x, y, z); g.add(l); }
  g.userData.colliders = colliders;
  g.userData.floor = FL;
  return g;
}
