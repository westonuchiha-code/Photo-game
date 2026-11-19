// Food set 1, remainder (queue item 16, photos/food/). Sculpted food is built as signed-distance shapes
// meshed with surface nets (the same mesher as the cats), so crumbs, flakes and grooves are real
// geometry, coloured per vertex from the photo's colours. All packaging, can and menu text is made up.
//   makeCornDog()        a crumb-coated corn dog (raised crumbs, toasted tips, a fried open end with the
//                        sausage showing) on its skewer, in a pink-diamond paper boat with a puddle of
//                        pink sauce with pepper flecks
//   makePorkBun()        a flaky baked bun on crinkled paper: domed top with flake ridges and sesame, one end
//                        bitten away showing the pastry layers and a chunky meat-and-scallion filling
//   makeMelonBread(kind) 'orange' (scored scalloped crust) or 'green' (diamond crust, in a crumpled wrapper)
//   makeKatsuCurry()     oval plate, glossy curry pool, a cutlet sliced into strips, red pickles
//   makeCheeseSticks()   pillow bag of smoked cheese sticks with a clear window (sticks visible inside)
//   makeYogurtDrink(), makeEnergyCan(), makeUmeSour(), makeCocoCan(), makeCandyPack()
//   makeDashiBottle(kind)   PET bottle of amber dashi with gold cap and a made-up label
//   makePizzaDisplay()   a take-out table with stacks of lidded pizza trays, price stickers, a handwritten card
//   makeNoodleShop()     a small soba shop front: lattice doors, half-curtain, white lanterns, the illustrated
//                        menu board, a drink vending machine (dashi bottles + cans) and a bench table
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { surfaceNets, noise3 } from './cat.js';
import { lantern } from './baralley28i.js';

const _L = new THREE.TextureLoader();
const _tc = new Map();
function ptex(name) {
  if (!_tc.has(name)) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; _tc.set(name, t); }
  return _tc.get(name);
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
const rbox = (w, h, d, r, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
function tube(a, b, r, mat, seg = 8) {
  const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return m;
}
function plane(w, h, mat, x, y, z, ry = 0, rx = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); return m; }
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hex = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const sat = (x) => Math.max(0, Math.min(1, x));
// fractal noise built from cat.js noise3 (0..1)
const fbm3 = (x, y, z, o = 3) => { let a = 0, f = 1, w = 1, t = 0; for (let i = 0; i < o; i++) { a += noise3(x * f, y * f, z * f) * w; t += w; f *= 2.03; w *= 0.5; } return a / t; };

// sculpt: mesh an SDF in a box and colour each vertex with colourFn(x, y, z) -> [r, g, b] (linear 0..1)
const _geoCache = new Map();
function sculpt(key, fn, min, max, step, colourFn, matOpts = {}) {
  let geo = _geoCache.get(key);
  if (!geo) {
    const { pos, idx } = surfaceNets(fn, min, max, step);
    geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    // normals from the SDF gradient (smooth, correct direction), then wind every triangle to face outward
    const e = step * 0.5, nrm = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i], y = pos[i + 1], z = pos[i + 2];
      let nx = fn(x + e, y, z) - fn(x - e, y, z), ny = fn(x, y + e, z) - fn(x, y - e, z), nz = fn(x, y, z + e) - fn(x, y, z - e);
      const l = Math.hypot(nx, ny, nz) || 1; nrm[i] = nx / l; nrm[i + 1] = ny / l; nrm[i + 2] = nz / l;
    }
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
      const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
      if (fx * nrm[a] + fy * nrm[a + 1] + fz * nrm[a + 2] < 0) { const s = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = s; }
    }
    geo.setIndex(idx);
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    const col = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) { const c = colourFn(pos[i], pos[i + 1], pos[i + 2]); col[i] = c[0]; col[i + 1] = c[1]; col[i + 2] = c[2]; }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    _geoCache.set(key, geo);
  }
  const m = new THREE.Mesh(geo, std({ vertexColors: true, roughness: 0.8, ...matOpts }));
  m.castShadow = m.receiveShadow = true;
  return m;
}
// linear colour helper: sRGB hex -> linear rgb (vertex colours are linear)
const lin = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };

// ------------------------------------------------------------------ paper boat with a diamond print
function paperBoat(L, W, H, flare) {
  const g = new THREE.Group();
  const pt = canvasTex(256, 512, (c, w, h) => {
    c.fillStyle = '#fbf8f2'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(240,150,140,0.55)'; c.lineWidth = 2;
    for (let k = -h; k < w + h; k += 28) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + h, h); c.stroke(); c.beginPath(); c.moveTo(k, h); c.lineTo(k + h, 0); c.stroke(); }
  });
  const inside = std({ map: pt, roughness: 0.9, side: THREE.DoubleSide });
  const base = plane(W, L, std({ color: '#f8f5ee', roughness: 0.9 }), 0, 0.001, 0, 0, -Math.PI / 2); g.add(base);
  const wall = (x0, z0, x1, z1, ox, oz) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([x0, 0.001, z0, x1, 0.001, z1, x1 + ox, H, z1 + oz, x0 + ox, H, z0 + oz], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 0.35, 0, 0.35], 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]); geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, inside));
  };
  wall(-W / 2, -L / 2, -W / 2, L / 2, -flare, 0); wall(W / 2, L / 2, W / 2, -L / 2, flare, 0);
  wall(W / 2, -L / 2, -W / 2, -L / 2, 0, -flare); wall(-W / 2, L / 2, W / 2, L / 2, 0, flare);
  // folded rim lips
  const rim = std({ color: '#fbf8f2', roughness: 0.9 });
  for (const [w, d, x, z] of [[W + 2 * flare, 0.004, 0, -L / 2 - flare], [W + 2 * flare, 0.004, 0, L / 2 + flare], [0.004, L + 2 * flare, -W / 2 - flare, 0], [0.004, L + 2 * flare, W / 2 + flare, 0]]) g.add(box(w, 0.003, d, rim, x, H, z));
  return g;
}

// ------------------------------------------------------------------ corn dog
export function makeCornDog() {
  const g = new THREE.Group(); g.name = 'corn_dog';
  g.add(paperBoat(0.2, 0.095, 0.036, 0.018));
  // the dog lies along z in the boat, tilted up toward the far end where the stick leaves
  const R = 0.026, z0 = -0.078, z1 = 0.072;
  const sdf = (x, y, z) => {
    const h = sat((z - z0) / (z1 - z0));
    const r = R * (0.92 + 0.12 * Math.sin(h * Math.PI)) * (1 + 0.05 * (noise3(z * 60, 3, 1) - 0.5));
    const cz = Math.max(z0, Math.min(z1, z));
    let d = Math.hypot(x, y, z - cz) - r;
    // crumbs: coarse bumps + fine grit (only on the coated surface)
    const c = noise3(x * 480, y * 480, z * 480), f = noise3(x * 1300 + 7, y * 1300, z * 1300);
    d -= 0.0024 * Math.pow(c, 3) + 0.0007 * f;
    // the fried open end: cut flat at z1 + a little
    d = Math.max(d, z - (z1 + 0.012));
    return d;
  };
  const gold = lin('#d79635'), light = lin('#f4cd78'), dark = lin('#8a4e18'), saus = lin('#a8473a'), batter = lin('#f2dcae');
  const col = (x, y, z) => {
    if (z > z1 + 0.008) { const rr = Math.hypot(x, y); return rr < R * 0.55 ? lerp3(saus, lin('#c86a58'), noise3(x * 900, y * 900, 0)) : batter; }
    const c = noise3(x * 480, y * 480, z * 480), f = noise3(x * 1300 + 7, y * 1300, z * 1300);
    let k = lerp3(gold, light, sat((c - 0.45) * 2.4));
    k = lerp3(k, dark, sat((0.32 - c) * 3) * 0.8 + (f > 0.8 ? 0.25 : 0));
    // toasted underside a bit darker where it touched the fryer basket
    return lerp3(k, dark, sat(-y / R) * 0.15);
  };
  const dog = sculpt('corndog', sdf, V(-0.04, -0.04, -0.12), V(0.04, 0.04, 0.1), 0.0012, col, { roughness: 0.9 });
  dog.rotation.x = -0.09; dog.position.set(0.004, 0.03, 0.0); g.add(dog);
  // skewer out the near end and over the rim (the photo's stick leaves at the top)
  const stick = tube(V(0.004, 0.032, -0.06), V(-0.002, 0.07, -0.29), 0.0022, std({ color: '#d8c193', roughness: 0.8 }), 6); g.add(stick);
  // sauce puddle: a soft flattened blob, pink with black pepper flecks and a glossy skin
  const sauceSdf = (x, y, z) => {
    const r = Math.hypot(x / 0.026, z / 0.042) * (1 + 0.15 * (noise3(x * 120, 0, z * 120) - 0.5));
    const top = 0.0045 * Math.max(0, 1 - r * r);
    return Math.max(Math.max((r - 1) * 0.02, y - top), -y);
  };
  const sCol = (x, y, z) => (noise3(x * 1500, y * 1500, z * 1500) > 0.83 ? lin('#3a2a24') : lerp3(lin('#f2b9a6'), lin('#e9a28c'), noise3(x * 90, 0, z * 90)));
  const sauce = sculpt('cd_sauce', sauceSdf, V(-0.034, -0.002, -0.06), V(0.034, 0.008, 0.06), 0.0011, sCol, { roughness: 0.15 });
  sauce.position.set(-0.022, 0.002, 0.045); g.add(sauce);
  return g;
}

// ------------------------------------------------------------------ pork bun (bitten)
export function makePorkBun() {
  const g = new THREE.Group(); g.name = 'pork_bun';
  // crinkled white paper sheet underneath
  const pgeo = new THREE.PlaneGeometry(0.2, 0.18, 40, 36); const pp = pgeo.attributes.position;
  for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i); pp.setZ(i, 0.004 * (noise3(x * 90, y * 90, 1) - 0.5) + 0.006 * Math.max(0, Math.abs(x) - 0.07) * 40 * 0.1); }
  pgeo.computeVertexNormals();
  const paper = new THREE.Mesh(pgeo, std({ color: '#f6f4ee', roughness: 0.95, side: THREE.DoubleSide })); paper.rotation.x = -Math.PI / 2; paper.position.y = 0.002; g.add(paper);
  // the bun: an oval dome 13 x 9 cm, 5 cm tall, with flaky ridges; bitten at +x
  const A = 0.066, B = 0.046, H = 0.048;
  const outer = (x, y, z) => {
    const px = x / A, pz = z / B, py = y / H;
    const k0 = Math.hypot(px, py, pz), k1 = Math.hypot(px / A, py / H, pz / B);
    let d = k1 === 0 ? -0.04 : k0 * (k0 - 1) / k1;
    d = Math.max(d, -y);                                   // flat bottom
    // flake ridges: layered sheets wrapping the dome, slightly lifted at random
    const sheet = Math.sin((y / H) * 16 + noise3(x * 40, y * 40, z * 40) * 5);
    d -= 0.0009 * sheet * sheet + 0.0012 * (fbm3(x * 90, y * 90, z * 90) - 0.5);
    return d;
  };
  // the bite: a scalloped arc of tooth marks (union of overlapping spheres), taken out of the +z/+x end
  const BITES = [[0.05, 0.03, 0.03, 0.03], [0.068, 0.03, 0.006, 0.03], [0.058, 0.03, -0.018, 0.028], [0.036, 0.034, 0.042, 0.024]];
  const bite = (x, y, z) => { let m = 1; for (const [bx, by, bz, br] of BITES) m = Math.min(m, Math.hypot(x - bx, (y - by) / 1.25, z - bz) - br); return -m - 0.001 * (noise3(x * 300, y * 300, z * 300) - 0.5) * 2; };
  const sdf = (x, y, z) => Math.max(outer(x, y, z), bite(x, y, z));
  const crust = lin('#b8701e'), crustL = lin('#dca048'), crustD = lin('#7a3e10'), layer = lin('#efd4a0'), meat = lin('#6a3c1e'), meatD = lin('#3e2210'), green = lin('#7a8a2a');
  const col = (x, y, z) => {
    const o = outer(x, y, z);
    if (bite(x, y, z) > -0.0015 && o < -0.0005) {          // on the bitten face
      const depth = -o;
      if (depth < 0.007) { const s = Math.sin(depth * 2400); return lerp3(layer, crustL, s > 0.6 ? 0.6 : 0.1); }      // pastry layers
      const n = noise3(x * 500, y * 500, z * 500);
      if (n > 0.78) return green;                           // scallion bits
      return lerp3(meat, meatD, sat((0.5 - n) * 2));
    }
    const n = fbm3(x * 140, y * 140, z * 140);
    let c = lerp3(crust, crustL, sat((y / H - 0.2) * 1.4) * 0.6 + (n - 0.5));
    c = lerp3(c, crustD, sat((0.38 - n) * 3));
    return c;
  };
  // the bitten face's filling bulges out a little (chunky)
  const sdf2 = (x, y, z) => {
    let d = sdf(x, y, z);
    if (bite(x, y, z) > -0.004 && outer(x, y, z) < -0.007) d -= 0.0025 * Math.pow(noise3(x * 260, y * 260, z * 260), 2);
    return d;
  };
  const bun = sculpt('porkbun', sdf2, V(-0.075, -0.004, -0.055), V(0.08, 0.06, 0.055), 0.0011, col, { roughness: 0.7 });
  bun.position.y = 0.003; g.add(bun);
  // sesame seeds on the crown: drop each onto the surface along -y
  const seedM = std({ color: '#f2e6c4', roughness: 0.4 });
  const seedG = new THREE.SphereGeometry(1, 8, 6);
  const r = rng(9);
  for (let i = 0; i < 70; i++) {
    const x = (r() - 0.5) * 1.3 * A, z = (r() - 0.5) * 1.4 * B;
    if ((x / A) ** 2 + (z / B) ** 2 > 0.55 || bite(x, 0.04, z) > -0.004) continue;
    let y = 0.07; while (y > 0 && sdf(x, y, z) > 0) y -= 0.0005;
    const s = new THREE.Mesh(seedG, seedM); s.scale.set(0.0022, 0.0009, 0.0013); s.position.set(x, y + 0.0035, z); s.rotation.y = r() * 3; g.add(s);
  }
  return g;
}

// ------------------------------------------------------------------ melon breads
export function makeMelonBread(kind = 'green') {
  const g = new THREE.Group(); g.name = `melon_bread_${kind}`;
  const R = kind === 'orange' ? 0.05 : 0.06, H = kind === 'orange' ? 0.042 : 0.04;
  const groove = kind === 'orange'
    ? (x, y, z) => { const a = Math.atan2(z, x); const s = Math.abs(Math.sin(a * 6 + Math.hypot(x, z) * 30)); return Math.pow(1 - s, 6); }      // scalloped segments
    : (x, y, z) => { const u = (x + z) * 60, v = (x - z) * 60; const s = Math.min(Math.abs(Math.sin(u)), Math.abs(Math.sin(v))); return Math.pow(1 - s, 10); };   // diamond grid
  const sdf = (x, y, z) => {
    const px = x / R, py = y / H, pz = z / R;
    const k0 = Math.hypot(px, py, pz), k1 = Math.hypot(px / R, py / H, pz / R);
    let d = k1 === 0 ? -0.03 : k0 * (k0 - 1) / k1;
    d = Math.max(d, -y + 0.004 * (1 - Math.min(1, Math.hypot(x, z) / R)) - 0.004);
    d += 0.0016 * groove(x, y, z) * sat(y / H * 3);                // scored crust
    d -= 0.0004 * noise3(x * 1200, y * 1200, z * 1200);              // sugar grit
    // the cookie crust cracks a little at the rim
    d -= 0.0012 * Math.pow(noise3(x * 180, y * 180, z * 180), 3) * sat(1 - y / H * 2);
    return d;
  };
  const top = kind === 'orange' ? lin('#f0a24a') : lin('#bcd8a2'), topL = kind === 'orange' ? lin('#ffd08a') : lin('#e2efcf'), side = kind === 'orange' ? lin('#e8b064') : lin('#d8e6c0'), seam = kind === 'orange' ? lin('#c26a1e') : lin('#9ab88a');
  const col = (x, y, z) => {
    let c = lerp3(side, top, sat(y / H * 1.6));
    c = lerp3(c, topL, (noise3(x * 1200, y * 1200, z * 1200) > 0.8 ? 0.7 : 0));
    return lerp3(c, seam, groove(x, y, z) * sat(y / H * 3) * 0.8);
  };
  const bread = sculpt(`melon_${kind}`, sdf, V(-R - 0.005, -0.002, -R - 0.005), V(R + 0.005, H + 0.004, R + 0.005), 0.0012, col, { roughness: 0.75 });
  g.add(bread);
  if (kind === 'orange') {
    // on a little green paper cup liner
    const liner = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.98, R * 0.85, 0.008, 32, 1, true), std({ color: '#3a9a5a', roughness: 0.8, side: THREE.DoubleSide })); liner.position.y = 0.004; g.add(liner);
  } else {
    // a crumpled clear wrapper around it, tucked under, with a twist at one end
    const wg = new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.62); const wp = wg.attributes.position;
    for (let i = 0; i < wp.count; i++) { const x = wp.getX(i), y = wp.getY(i), z = wp.getZ(i); const n = 1 + 0.06 * (noise3(x * 7, y * 7, z * 7) - 0.5) * 2; wp.setXYZ(i, x * (R + 0.008) * n, y * (H + 0.008) * n, z * (R + 0.008) * n); }
    wg.computeVertexNormals();
    g.add(new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ color: '#f4f8fa', transparent: true, opacity: 0.22, roughness: 0.15, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false })));
    const flat = new THREE.Mesh(new THREE.CircleGeometry(R * 1.5, 24), new THREE.MeshStandardMaterial({ color: '#f4f8fa', transparent: true, opacity: 0.25, roughness: 0.15, depthWrite: false }));
    flat.rotation.x = -Math.PI / 2; flat.position.y = 0.0015; flat.scale.set(1, 0.8, 1); g.add(flat);
    // a strip of black tape (sealing sticker) at the tuck
    g.add(box(0.03, 0.001, 0.008, std({ color: '#151515' }), R * 0.9, 0.002, R * 0.6));
  }
  return g;
}

// ------------------------------------------------------------------ katsu curry
export function makeKatsuCurry() {
  const g = new THREE.Group(); g.name = 'katsu_curry';
  // oval plate with a rim
  const pts = [[0, 0], [0.13, 0], [0.15, 0.006], [0.165, 0.018], [0.17, 0.02], [0.163, 0.022], [0.14, 0.012], [0, 0.01]].map(([a, b]) => new THREE.Vector2(a, b));
  const plateG = new THREE.LatheGeometry(pts, 64); plateG.scale(1, 1, 0.72);
  const plate = new THREE.Mesh(plateG, std({ color: '#f5f3ee', roughness: 0.18 })); plate.castShadow = plate.receiveShadow = true; g.add(plate);
  // curry pool: a dark glossy blob with a raised meniscus, potato/carrot lumps
  const poolSdf = (x, y, z) => {
    const d = Math.hypot(x / 0.12, z / 0.075) - 1 + 0.08 * (noise3(x * 40, 0, z * 40) - 0.5);
    let s = Math.max(d * 0.07, -y);
    s = Math.max(s, y - 0.006 - 0.003 * (1 - sat(d + 1)));
    s -= 0.004 * Math.pow(noise3(x * 70, y * 70, z * 70), 6) * 4;  // lumps of potato/meat under the sauce
    return s;
  };
  const pCol = (x, y, z) => (noise3(x * 70, y * 70, z * 70) > 0.78 ? lin('#8a4a1a') : lerp3(lin('#5a2c12'), lin('#7a4018'), noise3(x * 30, 2, z * 30)));
  const pool = sculpt('katsu_pool', poolSdf, V(-0.135, -0.002, -0.09), V(0.135, 0.014, 0.09), 0.0016, pCol, { roughness: 0.12 });
  pool.position.y = 0.01; g.add(pool);
  // the cutlet: one breaded slab sculpted with crumbs, cut into 6 slices that lean against each other; the cut
  // faces show pale pork with a white fat line under the crust
  const L = 0.15, Wc = 0.068, Hc = 0.016, gap = 0.0032, n = 6, pitch = L / n;
  const slab = (x, y, z) => {
    const qx = Math.abs(x) - L / 2 + 0.008, qy = Math.abs(y - Hc / 2) - Hc / 2 + 0.004, qz = Math.abs(z) - Wc / 2 * (1 - 0.15 * (2 * x / L) ** 2) + 0.008;
    const box = Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - 0.006;
    return box;
  };
  const cutDist = (x) => { const u = ((x + L / 2) / pitch) % 1; return Math.min(u, 1 - u) * pitch; };
  const katsuSdf = (x, y, z) => {
    let d = slab(x, y, z);
    const crust = d > -0.0025;
    if (crust) d -= 0.0012 * Math.pow(noise3(x * 520, y * 520, z * 520), 2.5) + 0.0005 * noise3(x * 1300, y * 1300, z * 1300);
    const inner = Math.abs(x) < L / 2 - 0.004;
    if (inner) d = Math.max(d, gap / 2 - cutDist(x));
    return d;
  };
  const kCol = (x, y, z) => {
    const sd = slab(x, y, z);
    if (Math.abs(x) < L / 2 - 0.004 && cutDist(x) < gap / 2 + 0.0012 && sd < -0.002) {      // a cut face
      if (sd > -0.0045) return lin('#c88838');                     // crust edge
      if (sd > -0.0062) return lin('#f6efe2');                     // fat line
      return lerp3(lin('#eadcc6'), lin('#d8c2a4'), noise3(x * 600, y * 600, z * 600));
    }
    const c = noise3(x * 520, y * 520, z * 520);
    return lerp3(lerp3(lin('#b06a1e'), lin('#e0a24e'), sat((c - 0.4) * 2.2)), lin('#6a3410'), sat((0.36 - c) * 3) * 0.8);
  };
  const katsu = sculpt('katsu', katsuSdf, V(-0.082, -0.002, -0.042), V(0.082, 0.022, 0.042), 0.0009, kCol, { roughness: 0.85 });
  katsu.position.set(0, 0.014, -0.004); katsu.rotation.y = 0.05; g.add(katsu);
  // red pickles (fukujinzuke) piled on the rim
  const pickM = std({ color: '#c8281e', roughness: 0.4 });
  const r = rng(5);
  for (let i = 0; i < 18; i++) { const p = box(0.006 + r() * 0.004, 0.0015, 0.003 + r() * 0.002, pickM, 0.105 + (r() - 0.5) * 0.026, 0.018 + r() * 0.004, 0.045 + (r() - 0.5) * 0.02); p.rotation.set((r() - 0.5) * 0.8, r() * 3, (r() - 0.5) * 0.8); g.add(p); }
  // a spoon resting on the rim
  const spoonM = std({ color: '#d8dadc', metalness: 0.85, roughness: 0.2 });
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), spoonM); bowl.scale.set(0.022, 0.006, 0.014); bowl.position.set(-0.1, 0.03, 0.09); g.add(bowl);
  g.add(tube(V(-0.08, 0.03, 0.093), V(0.03, 0.025, 0.1), 0.003, spoonM, 6));
  return g;
}

// ------------------------------------------------------------------ packaged snacks + drinks
function labelCan(r, h, labelTex, opts = {}) {
  const g = new THREE.Group();
  const alu = std({ color: '#c9cdd0', metalness: 0.85, roughness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.86, 40, 1, true), std({ map: labelTex, metalness: opts.metal ?? 0.45, roughness: 0.3 }));
  body.position.y = h / 2; g.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r, h * 0.07, 40), alu); top.position.y = h * 0.965; g.add(top);
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.88, h * 0.07, 40), alu); bot.position.y = h * 0.035; g.add(bot);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(r * 0.84, 32), alu); lid.rotation.x = -Math.PI / 2; lid.position.y = h + 0.0005; g.add(lid);
  const tab = rbox(r * 0.55, 0.0012, r * 0.3, 0.0005, alu, 0, h + 0.0012, r * 0.25); g.add(tab);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
export function makeEnergyCan() {      // gold energy drink with an original cartoon strongman (made up)
  const t = canvasTex(512, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2c14a'); gr.addColorStop(1, '#d48a1a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c8201e'; c.fillRect(0, 0, w, 40); c.fillRect(0, h - 36, w, 36);
    c.save(); c.translate(130, 150); c.rotate(-0.12); c.fillStyle = '#ffffff'; c.strokeStyle = '#7a1010'; c.lineWidth = 8; c.font = `86px ${F.retro}`; c.textAlign = 'center'; c.strokeText('MAX', 0, -20); c.fillText('MAX', 0, -20); c.strokeText('GOLD', 0, 60); c.fillText('GOLD', 0, 60); c.restore();
    // cartoon strongman: round head, big grin, flexed arms
    const cx = 360, cy = 140;
    c.fillStyle = '#f2c08a'; c.beginPath(); c.arc(cx, cy - 30, 34, 0, 7); c.fill(); c.strokeStyle = '#3a1a0a'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy - 22, 16, 0, Math.PI); c.fill(); c.stroke();
    c.fillStyle = '#111'; c.beginPath(); c.arc(cx - 12, cy - 40, 4, 0, 7); c.arc(cx + 12, cy - 40, 4, 0, 7); c.fill();
    c.fillStyle = '#f2c08a'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(cx + s * 60, cy + 10, 26, 18, s * 0.5, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(cx + s * 70, cy - 20, 16, 0, 7); c.fill(); c.stroke(); }
    c.beginPath(); c.ellipse(cx, cy + 30, 44, 34, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.font = `22px ${F.label}`; c.textAlign = 'center'; c.fillText('ENERGY · 190 ml', w / 2, h - 12);
  });
  return labelCan(0.027, 0.105, t);
}
export function makeUmeSour() {        // black + red plum sour can (made up)
  const t = canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = '#1a1a1c'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c8202a'; c.fillRect(0, 0, 150, h); c.fillRect(w - 60, 0, 60, h);
    c.fillStyle = '#f6efe2'; fitText(c, '梅', 250, 90, 160, 140, F.brush);
    fitText(c, 'サワー', 250, 196, 200, 60, F.antique);
    c.fillStyle = '#f2c14a'; c.beginPath(); c.arc(75, 200, 34, 0, 7); c.fill(); c.fillStyle = '#c8202a'; fitText(c, '9%', 75, 202, 56, 34, F.heavy);
    c.fillStyle = '#ffffff'; c.save(); c.translate(75, 90); c.rotate(-Math.PI / 2); fitText(c, 'UME SOUR', 0, 0, 160, 34, F.heavy); c.restore();
    c.fillStyle = '#e8d8c8'; fitText(c, 'STRONG PLUM CHUHAI · 350 ml', 400, 230, 200, 16, F.small);
  });
  return labelCan(0.033, 0.122, t);
}
export function makeCocoCan() {        // tall slim sky-blue coconut jelly drink (made up)
  const t = canvasTex(512, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fd4f0'); gr.addColorStop(1, '#2aa6dc'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(30 + i * 45, 40 + (i % 3) * 14, 7, 0, 7); c.fill(); }
    // coconut half with milk
    c.fillStyle = '#6a3e1e'; c.beginPath(); c.arc(330, 175, 62, 0, Math.PI); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(330, 175, 58, 18, 0, 0, 7); c.fill();
    c.save(); c.translate(140, 128); c.rotate(-0.08); c.fillStyle = '#ff5a8a'; c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.font = `84px ${F.bubbly}`; c.textAlign = 'center'; c.strokeText('Coco', 0, -10); c.fillText('Coco', 0, -10); c.fillStyle = '#ffd23a'; c.strokeText('Pop', 10, 70); c.fillText('Pop', 10, 70); c.restore();
    c.fillStyle = '#ffffff'; fitText(c, 'coconut jelly drink · 240 ml', w / 2, h - 16, w - 40, 18, F.small);
  });
  return labelCan(0.026, 0.135, t);
}
export function makeCandyPack() {
  const g = new THREE.Group();
  const t = canvasTex(256, 384, (c, w, h) => {
    c.fillStyle = '#d8202a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffd23a'; c.save(); c.translate(w / 2, h / 2); c.rotate(-0.35); c.font = `70px ${F.bubbly}`; c.textAlign = 'center'; c.strokeStyle = '#7a1010'; c.lineWidth = 6; c.strokeText('Fruity', 0, -10); c.fillText('Fruity', 0, -10); c.fillStyle = '#ff8a2a'; c.strokeText('Chews', 0, 60); c.fillText('Chews', 0, 60); c.restore();
    for (const [x, y, col] of [[50, 320, '#3aa83a'], [200, 60, '#ffa62a'], [210, 330, '#a83ad8']]) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 26, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.arc(x - 8, y - 8, 8, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < 20; y += 4) { c.fillRect(0, y, w, 2); c.fillRect(0, h - y - 2, w, 2); }
  });
  const geo = new THREE.BoxGeometry(0.065, 0.1, 0.012, 8, 12, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const pinch = 1 - Math.pow(Math.abs(y) / 0.05, 6); p.setZ(i, z * pinch + 0.0015 * Math.sin(x * 300 + y * 200)); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, [std({ color: '#c81e28' }), std({ color: '#c81e28' }), std({ color: '#c81e28' }), std({ color: '#c81e28' }), std({ map: t, roughness: 0.25, metalness: 0.3 }), std({ color: '#c8c8c8', roughness: 0.3, metalness: 0.6 })]);
  m.castShadow = true; g.add(m);
  return g;
}
export function makeYogurtDrink() {
  const g = new THREE.Group();
  const pts = [[0, 0], [0.026, 0], [0.028, 0.004], [0.028, 0.085], [0.024, 0.1], [0.016, 0.11], [0.016, 0.118], [0, 0.118]].map(([a, b]) => new THREE.Vector2(a, b));
  const t = canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#e83a6a'; fitText(c, 'Hokuyo Farm', w / 2, 70, w - 100, 54, F.script);
    c.fillStyle = '#2a8a4a'; fitText(c, 'drinking yogurt', w / 2, 130, w - 160, 40, F.rounded);
    c.fillStyle = '#e8506a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(140 + i * 58, 190, 16, 0, 7); c.fill(); }
    c.fillStyle = '#3aa85a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(150 + i * 58, 172, 10, 5, 0.6, 0, 7); c.fill(); }
    c.fillStyle = '#555'; fitText(c, 'strawberry · 180 g', w / 2, 234, w - 200, 22, F.small);
  });
  const bottle = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), std({ color: '#fafafa', roughness: 0.35 })); g.add(bottle);
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.0285, 0.0285, 0.06, 36, 1, true), std({ map: t, roughness: 0.4 })); lab.position.y = 0.05; g.add(lab);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 24), std({ color: '#1e7a3e', roughness: 0.4 })); cap.position.y = 0.127; g.add(cap);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
export function makeCheeseSticks() {
  const g = new THREE.Group(); g.name = 'cheese_sticks';
  const W = 0.15, H = 0.22, T = 0.035;
  // label: top 60% printed yellow with the made-up name + cheese drawing, bottom clear window
  const t = canvasTex(512, 768, (c, w, h) => {
    c.fillStyle = 'rgba(235,240,245,0.28)'; c.fillRect(0, 0, w, h);                       // the clear film
    c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 9; i++) c.fillRect(40 + i * 50, h * 0.66, 6, h * 0.28);   // creases / glare
    c.fillStyle = '#f5b324'; c.fillRect(0, 0, w, h * 0.6); c.fillRect(0, h - 26, w, 26); c.fillRect(0, 0, 18, h); c.fillRect(w - 18, 0, 18, h);
    c.beginPath(); c.moveTo(0, h * 0.6); for (let x = 0; x <= w; x += 32) c.quadraticCurveTo(x + 16, h * 0.64, x + 32, h * 0.6); c.lineTo(w, h * 0.6); c.fill();
    c.fillStyle = '#c8201e'; c.beginPath(); c.arc(40, 50, 22, 0, 7); c.fill(); c.fillStyle = '#fff'; fitText(c, 'N', 40, 52, 30, 30, F.heavy);
    // cheese wheel drawing
    c.fillStyle = '#ffe07a'; c.strokeStyle = '#7a4a10'; c.lineWidth = 4; c.beginPath(); c.ellipse(360, 120, 90, 40, 0, 0, 7); c.fill(); c.stroke(); c.fillRect(270, 120, 180, 50); c.strokeRect(270, 120, 180, 50); c.beginPath(); c.ellipse(360, 170, 90, 40, 0, 0, Math.PI); c.fill(); c.stroke();
    c.fillStyle = '#c8201e'; c.save(); c.translate(60, 230); c.rotate(-0.08); c.fillStyle = '#fff'; c.fillRect(0, -50, 260, 90); c.fillStyle = '#c8201e'; fitText(c, 'VALUE', 130, -4, 240, 76, F.heavy); c.restore();
    c.fillStyle = '#5a2a0a'; fitText(c, 'SMOKED', w / 2, 330, w - 60, 82, F.heavy, { spacing: 4 });
    fitText(c, 'CHEESE STICKS', w / 2, 410, w - 50, 60, F.heavy);
    c.fillStyle = '#ffffff'; c.fillRect(30, h - 70, w - 60, 40); c.fillStyle = '#c8201e'; fitText(c, 'bite-size · resealable', w / 2, h - 50, w - 100, 24, F.label);
  });
  const geo = new THREE.BoxGeometry(W, H, T, 12, 18, 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const pinch = Math.pow(sat(1 - Math.pow(Math.abs(y) / (H / 2), 5)), 0.6) * Math.pow(sat(1 - Math.pow(Math.abs(x) / (W / 2), 8)), 0.5); p.setZ(i, z * pinch); }
  geo.computeVertexNormals();
  const film = new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.2, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  const bag = new THREE.Mesh(geo, film); bag.position.y = H / 2; g.add(bag);
  // crimped seals top and bottom
  for (const y of [0.006, H - 0.006]) g.add(box(W, 0.012, 0.004, std({ color: '#f5b324', roughness: 0.4 }), 0, y, 0));
  // the sticks inside, piled in the lower window
  const stickM = std({ color: '#e9b04e', roughness: 0.45 }), endM = std({ color: '#b8762a', roughness: 0.6 });
  const r = rng(12);
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.024 + r() * 0.012, 12), [stickM, endM, endM]);
    s.position.set((r() - 0.5) * (W - 0.03), 0.018 + r() * 0.07, (r() - 0.5) * T * 0.5); s.rotation.set(r() * 3, r() * 3, r() * 3); g.add(s);
  }
  return g;
}
export function makeDashiBottle(kind = 0) {
  const g = new THREE.Group();
  const pts = [[0, 0], [0.034, 0], [0.036, 0.006], [0.036, 0.13], [0.03, 0.17], [0.014, 0.2], [0.013, 0.215], [0, 0.215]].map(([a, b]) => new THREE.Vector2(a, b));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 36), new THREE.MeshStandardMaterial({ color: '#d8a24a', transparent: true, opacity: 0.75, roughness: 0.08, metalness: 0.05 })));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0155, 0.0155, 0.022, 24), std({ color: '#c9a24a', metalness: 0.7, roughness: 0.3 })); cap.position.y = 0.225; g.add(cap);
  const col = kind ? '#c8202a' : '#2a5ab0';
  const t = canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = '#f2ead8'; c.fillRect(0, 0, w, h);
    c.fillStyle = col; c.fillRect(0, 0, 70, h); c.fillRect(w - 70, 0, 70, h);
    c.fillStyle = '#1a1a1a'; fitText(c, '焼', w / 2 - 50, 70, 90, 80, F.brush); fitText(c, '出汁', w / 2 + 40, 140, 140, 110, F.brush);
    c.fillStyle = col; fitText(c, kind ? '特製' : '冷', w / 2 - 60, 190, 80, 54, F.antique);
    c.fillStyle = '#333'; fitText(c, 'GRILLED FISH DASHI · 500 ml', w / 2, 238, w - 180, 20, F.small);
  });
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.0365, 0.0365, 0.075, 36, 1, true), std({ map: t, roughness: 0.4 })); lab.position.y = 0.085; g.add(lab);
  return g;
}

// ------------------------------------------------------------------ pizza take-out display
export function makePizzaDisplay() {
  const g = new THREE.Group(); g.name = 'pizza_display';
  const wood = std({ color: '#6a4a2a', roughness: 0.6 });
  g.add(box(1.2, 0.05, 0.7, wood, 0, 0.8, 0));
  for (const [x, z] of [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]]) g.add(box(0.05, 0.8, 0.05, wood, x, 0.4, z));
  g.add(box(1.2, 0.3, 0.02, std({ color: '#f2c21a', roughness: 0.6 }), 0, 0.65, 0.35));   // yellow front skirt
  const trayM = std({ color: '#141414', roughness: 0.4 });
  const lidM = new THREE.MeshStandardMaterial({ color: '#eef4f6', transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false });
  const pizzas = ['food_pizza_mushroom', 'food_pizza_corn'];
  const stickerT = (i) => canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8202a'; c.fillRect(0, 0, w, 16); c.fillStyle = '#fff'; c.font = `12px ${F.label}`; c.textAlign = 'center'; c.fillText(i % 2 ? 'CORN & SHRIMP' : 'MUSHROOM EGG', w / 2, 12); c.fillStyle = '#111'; c.font = `26px ${F.heavy}`; c.fillText(`¥${[680, 780, 598][i % 3]}`, w / 2, 48); });
  const stacks = [[-0.35, -0.12, 4], [0.05, -0.15, 3], [0.38, -0.08, 5], [-0.2, 0.18, 2], [0.25, 0.2, 3]];
  stacks.forEach(([x, z, n], si) => {
    for (let k = 0; k < n; k++) {
      const y = 0.825 + k * 0.032, R = 0.14;
      const tray = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.95, 0.012, 40), trayM); tray.position.set(x, y + 0.006, z); g.add(tray);
      const top = new THREE.Mesh(new THREE.CircleGeometry(R * 0.9, 40), std({ map: ptex(pizzas[(si + k) % 2]), roughness: 0.6 })); top.rotation.x = -Math.PI / 2; top.position.set(x, y + 0.0135, z); g.add(top);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.98, R, 0.018, 40, 1, true), lidM); lid.position.set(x, y + 0.021, z); g.add(lid);
      const lidTop = new THREE.Mesh(new THREE.CircleGeometry(R * 0.98, 40), lidM); lidTop.rotation.x = -Math.PI / 2; lidTop.position.set(x, y + 0.03, z); g.add(lidTop);
      const st = plane(0.05, 0.025, std({ map: stickerT(si + k), roughness: 0.5 }), x + 0.04, y + 0.031, z + 0.05, 0, -Math.PI / 2); g.add(st);
    }
  });
  // handwritten card on a little stand
  const card = canvasTex(256, 384, (c, w, h) => {
    c.fillStyle = '#fbf5e6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c8202a'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#1a1a1a'; fitText(c, 'fresh baked', w / 2, 60, w - 40, 40, F.hand); fitText(c, 'this morning!', w / 2, 110, w - 40, 40, F.hand);
    c.fillStyle = '#c8202a'; fitText(c, 'PIZZA', w / 2, 190, w - 50, 70, F.marker); c.fillStyle = '#1a1a1a'; fitText(c, '2 for ¥1200', w / 2, 270, w - 40, 44, F.hand); fitText(c, 'warm in 3 min', w / 2, 320, w - 40, 30, F.hand);
  });
  const cs = new THREE.Group(); cs.add(box(0.14, 0.21, 0.004, std({ map: card, roughness: 0.8 }), 0, 0.12, 0)); cs.add(tube(V(0, 0, -0.03), V(0, 0.18, 0), 0.003, std({ color: '#222' }), 4));
  cs.position.set(-0.45, 0.825, 0.25); cs.rotation.x = -0.15; g.add(cs);
  g.traverse((o) => { if (o.isMesh && !o.material.transparent) o.castShadow = true; });
  return g;
}

// ------------------------------------------------------------------ the noodle shop front, menu board, vending machine, bench table
function menuBoardTex() {
  const imgs = {};
  for (const n of ['food_ramen_top', 'food_curry_rice', 'food_katsu', 'food_spaghetti', 'food_cupnoodle_top']) { const im = new Image(); im.src = `assets/textures/${n}.png`; imgs[n] = im; }
  const draw = (c, w, h) => {
    c.fillStyle = '#1a1612'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#f2ead8'; c.fillRect(20, 20, w - 40, 110);
    c.fillStyle = '#1a1a1a'; fitText(c, 'そば・うどん  麦庵', w / 2, 76, w - 120, 84, F.brush);
    c.fillStyle = '#c8202a'; c.beginPath(); c.arc(w - 70, 75, 30, 0, 7); c.fill(); c.fillStyle = '#fff'; fitText(c, '手打', w - 70, 77, 44, 26, F.antique);
    const items = [['ramen', 'food_ramen_top', 'ラーメン', 780], ['curry', 'food_curry_rice', 'カレー', 850], ['katsu', 'food_katsu', 'カツ丼', 950], ['soba', null, 'ざるそば', 680], ['tendon', null, '天丼', 980], ['udon', null, 'うどん', 620], ['spag', 'food_spaghetti', '海老', 1100], ['oyako', null, '親子丼', 880], ['cup', 'food_cupnoodle_top', '冷', 520]];
    items.forEach(([key, tex, name, price], i) => {
      const col = i % 3, row = Math.floor(i / 3), x = 40 + col * 320, y = 160 + row * 196, cw = 300, ch = 180;
      c.fillStyle = '#2a2420'; c.fillRect(x, y, cw, ch);
      // the food picture: photo textures where we have one, otherwise a drawn bowl
      const img = tex ? imgs[tex] : null;
      if (img && img.complete && img.naturalWidth) c.drawImage(img, x + 8, y + 8, cw - 16, ch - 56);
      else {
        c.fillStyle = '#3a2e26'; c.fillRect(x + 8, y + 8, cw - 16, ch - 56);
        c.fillStyle = '#1c1c1c'; c.beginPath(); c.ellipse(x + cw / 2, y + 70, 100, 48, 0, 0, 7); c.fill();
        c.fillStyle = key === 'soba' ? '#7a6a52' : key === 'udon' ? '#efe6cc' : '#d8a040'; c.beginPath(); c.ellipse(x + cw / 2, y + 66, 88, 38, 0, 0, 7); c.fill();
        if (key === 'tendon') for (let k = 0; k < 3; k++) { c.fillStyle = '#e8b050'; c.beginPath(); c.ellipse(x + cw / 2 - 40 + k * 40, y + 60, 26, 14, k, 0, 7); c.fill(); }
        if (key === 'oyako') { c.fillStyle = '#f2c43a'; c.beginPath(); c.ellipse(x + cw / 2, y + 62, 60, 24, 0, 0, 7); c.fill(); c.fillStyle = '#3a8a2a'; c.fillRect(x + cw / 2 - 10, y + 54, 20, 6); }
        if (key === 'soba') { c.strokeStyle = '#5a4a3a'; c.lineWidth = 2; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(x + 80 + k * 10, y + 40); c.quadraticCurveTo(x + 90 + k * 10, y + 70, x + 80 + k * 10, y + 95); c.stroke(); } }
        if (key === 'udon') { c.strokeStyle = '#d8cca8'; c.lineWidth = 6; for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(x + 90 + k * 16, y + 46); c.quadraticCurveTo(x + 100 + k * 16, y + 72, x + 92 + k * 16, y + 92); c.stroke(); } }
      }
      c.fillStyle = '#f2ead8'; fitText(c, name, x + 100, y + ch - 24, 180, 36, F.antique);
      c.fillStyle = '#f2c14a'; fitText(c, `¥${price}`, x + cw - 64, y + ch - 24, 110, 34, F.heavy);
    });
  };
  const t = canvasTex(1024, 768, draw);
  for (const im of Object.values(imgs)) im.addEventListener('load', () => { draw(t.image.getContext('2d'), 1024, 768); t.needsUpdate = true; });
  return t;
}
function vendingMachine() {
  const g = new THREE.Group();
  const W = 1.0, H = 1.83, D = 0.72;
  // display window: three shelves of samples behind glass, lit
  const winH = 0.86, winY = 1.28;
  const blue = std({ color: '#1d4fa8', roughness: 0.35, metalness: 0.2 });
  // cabinet: a deep back body, then a front frame around the recessed window
  g.add(rbox(W, H, D - 0.16, 0.02, blue, 0, H / 2, -0.08));
  const wb = winY - winH / 2, wt = winY + winH / 2;
  g.add(box(W, wb, 0.16, blue, 0, wb / 2, D / 2 - 0.08));
  g.add(box(W, H - wt, 0.16, blue, 0, wt + (H - wt) / 2, D / 2 - 0.08));
  for (const sx of [-1, 1]) g.add(box(0.05, winH, 0.16, blue, sx * (W / 2 - 0.025), winY, D / 2 - 0.08));
  // a white header with a made-up mark
  const hd = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d4fa8'; fitText(c, 'NAMI DRINKS', w / 2, h / 2, w - 60, 56, F.heavy, { spacing: 8 }); });
  g.add(plane(W - 0.1, 0.16, std({ map: hd, emissive: '#ffffff', emissiveIntensity: 0.4, emissiveMap: hd }), 0, H - 0.17, D / 2 + 0.002));
  g.add(box(W - 0.1, winH, 0.02, std({ color: '#eef2f6', emissive: '#ffffff', emissiveIntensity: 0.55 }), 0, winY, D / 2 - 0.15));
  const samples = [];
  for (let row = 0; row < 3; row++) {
    const y = winY - winH / 2 + 0.05 + row * 0.28;
    g.add(box(W - 0.12, 0.012, 0.12, std({ color: '#d8dce0' }), 0, y, D / 2 - 0.06));
    for (let k = 0; k < 6; k++) {
      const x = -0.37 + k * 0.148;
      let s;
      if (row === 0) { s = makeDashiBottle(k % 2); s.scale.setScalar(0.92); }
      else if (row === 1) s = [makeUmeSour, makeEnergyCan, makeCocoCan][k % 3]();
      else { s = makeDashiBottle((k + 1) % 2); s.scale.setScalar(0.92); }
      s.position.set(x, y + 0.006, D / 2 - 0.07); g.add(s); samples.push(s);
      // price strip with a button
      const pt = canvasTex(128, 48, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = row === 1 ? '#c8202a' : '#2a5ab0'; c.fillRect(0, 0, w, 16); c.fillStyle = '#fff'; c.font = `12px ${F.label}`; c.textAlign = 'center'; c.fillText(row === 1 ? 'つめたい' : 'つめたい', w / 2, 12); c.fillStyle = '#111'; c.font = `22px ${F.heavy}`; c.fillText(`¥${row === 1 ? 160 + k * 10 : 800 + (k % 2) * 100}`, w / 2, 40); });
      g.add(plane(0.12, 0.045, std({ map: pt, emissive: '#ffffff', emissiveIntensity: 0.25, emissiveMap: pt }), x, y - 0.03, D / 2 - 0.012));
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 14), glow(1.8, 1.8, 2.2)); b.rotation.x = Math.PI / 2; b.position.set(x, y - 0.065, D / 2 - 0.012); g.add(b);
    }
  }
  g.add(box(W - 0.1, winH, 0.008, new THREE.MeshStandardMaterial({ color: '#dfeef4', transparent: true, opacity: 0.18, roughness: 0.03, depthWrite: false }), 0, winY, D / 2 - 0.005));
  // coin / bill panel, change cup, pickup flap, brand-free stripe
  g.add(box(0.2, 0.32, 0.02, std({ color: '#1a1a1a', roughness: 0.4 }), 0.33, 0.68, D / 2 + 0.005));
  g.add(box(0.1, 0.012, 0.012, std({ color: '#c0c4c8', metalness: 0.8 }), 0.33, 0.78, D / 2 + 0.016));
  g.add(box(0.14, 0.04, 0.012, std({ color: '#c0c4c8', metalness: 0.8 }), 0.33, 0.68, D / 2 + 0.016));
  g.add(box(0.07, 0.06, 0.04, std({ color: '#111' }), 0.33, 0.56, D / 2 + 0.02));
  g.add(box(0.7, 0.2, 0.03, std({ color: '#1a1a1a', roughness: 0.3 }), -0.08, 0.22, D / 2 + 0.005));
  g.add(box(0.66, 0.16, 0.01, std({ color: '#2a2a2a', roughness: 0.2, metalness: 0.4 }), -0.08, 0.22, D / 2 + 0.022));
  const st = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d4fa8'; fitText(c, 'cold drinks · dashi · 24h', w / 2, h / 2, w - 40, 44, F.label, { spacing: 2 }); });
  g.add(plane(0.9, 0.17, std({ map: st, emissive: '#ffffff', emissiveIntensity: 0.3, emissiveMap: st }), 0, 0.42, D / 2 + 0.002));
  const vl = new THREE.PointLight('#e8f0ff', 1.2, 3, 1.6); vl.position.set(0, 1.3, D / 2 + 0.4); g.add(vl);
  return g;
}
export function makeNoodleShop() {
  const g = new THREE.Group(); g.name = 'noodle_shop';
  const W = 8, D = 6, FH = 3.2, HB = 4.6;
  const plaster = std({ color: '#d8d2c4', roughness: 0.9 });
  const darkWood = std({ color: '#3a2618', roughness: 0.55 });
  // building block behind the front (front plane at z = 0, facing +z)
  g.add(box(W, HB + 0.4, D, plaster, 0, (HB + 0.4) / 2, -D / 2));
  // lower front: dark grey stone tile base, lattice sliding doors (lit), big window with the menu board
  const tile = canvasTex(256, 256, (c, w, h) => { const r = rng(3); for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const t = 52 + r() * 20; c.fillStyle = `rgb(${t},${t},${t + 2})`; c.fillRect(i * 32, j * 32, 31, 31); } });
  tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(W / 1.2, 0.5);
  g.add(plane(W, 0.6, std({ map: tile, roughness: 0.5 }), 0, 0.3, 0.012));
  g.add(box(W, FH - 0.6, 0.1, darkWood, 0, 0.6 + (FH - 0.6) / 2, -0.04));
  const lat = canvasTex(256, 512, (c, w, h) => { c.fillStyle = '#f6e6c4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a2618'; c.lineWidth = 6; for (let x = 0; x <= w; x += 42) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
  for (const x of [1.1, 2.0]) {
    g.add(plane(0.88, 2.0, std({ map: lat, emissive: '#ffd090', emissiveMap: lat, emissiveIntensity: 0.7 }), x + 1.1, 1.0, 0.02));
  }
  g.add(box(1.9, 0.08, 0.12, darkWood, 2.65, 2.04, 0.0));
  // half curtain over the door with the made-up name
  const nt = canvasTex(768, 256, (c, w, h) => { c.fillStyle = '#4a2a6a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2ead8'; fitText(c, 'そば', w * 0.3, h / 2 + 10, 220, 150, F.brush); fitText(c, 'うどん', w * 0.72, h / 2 + 10, 280, 130, F.brush); c.fillStyle = '#f4eee4'; for (let k = 1; k < 4; k++) c.fillRect(k * w / 4 - 3, h * 0.3, 6, h); });
  g.add(plane(2.0, 0.65, std({ map: nt, side: THREE.DoubleSide, roughness: 0.85 }), 2.65, 2.3, 0.12));
  g.add(tube(V(1.6, 2.64, 0.12), V(3.7, 2.64, 0.12), 0.02, darkWood, 6));
  // menu board in a dark frame (left), lit
  g.add(box(2.1, 1.6, 0.08, std({ color: '#2a2018', roughness: 0.5 }), -1.2, 1.55, 0.06));
  g.add(plane(2.0, 1.5, std({ map: menuBoardTex(), emissive: '#ffffff', emissiveIntensity: 0.32, roughness: 0.4 }), -1.2, 1.55, 0.102));
  g.children[g.children.length - 1].material.emissiveMap = g.children[g.children.length - 1].material.map;
  const ml = new THREE.PointLight('#fff0d8', 1.6, 3.5, 1.6); ml.position.set(-1.2, 2.6, 0.7); g.add(ml);
  // vertical name sign beside the board
  const vt = canvasTex(160, 640, (c, w, h) => { c.fillStyle = '#f6f2e8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a2618'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#1a1a1a'; ['ざ', 'る', 'そ', 'ば'].forEach((ch, i) => fitText(c, ch, w / 2, 90 + i * 120, w - 30, 110, F.brush)); c.fillStyle = '#c8202a'; fitText(c, '¥680', w / 2, h - 50, w - 30, 40, F.heavy); });
  g.add(plane(0.36, 1.45, std({ map: vt, roughness: 0.6 }), 0.05, 1.55, 0.11));
  // white lanterns in a row under the eave
  for (let i = 0; i < 7; i++) { const l = lantern(0.17, 0.36, '#f6f2e8', i % 2 ? 'そば' : 'うどん', '#1a1a1a', i + 30); l.position.set(-3.3 + i * 1.0, FH + 0.22, 0.35); g.add(l); }
  g.add(box(W, 0.06, 0.06, darkWood, 0, FH + 0.66, 0.35));
  // eave + purple banner sign above
  g.add(box(W + 0.2, 0.12, 0.8, darkWood, 0, FH + 0.75, 0.25));
  const bt = canvasTex(1024, 160, (c, w, h) => { c.fillStyle = '#4a2a6a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2ead8'; fitText(c, '手打ち そば・うどん  麦庵', w / 2, h / 2 + 6, w - 120, 100, F.brush); });
  g.add(plane(W - 0.4, 0.7, std({ map: bt, roughness: 0.7, emissive: '#ffffff', emissiveMap: bt, emissiveIntensity: 0.15 }), 0, FH + 1.25, 0.02));
  // vending machine at the right end of the front, a bench table out front
  const vm = vendingMachine(); vm.position.set(3.35, 0, 0.4); g.add(vm);
  const tbl = new THREE.Group();
  const tw = std({ color: '#8a6a44', roughness: 0.6 });
  tbl.add(box(1.8, 0.05, 0.7, tw, 0, 0.72, 0));
  for (const x of [-0.8, 0.8]) tbl.add(box(0.06, 0.72, 0.6, tw, x, 0.36, 0));
  for (const z of [-0.6, 0.6]) { tbl.add(box(1.8, 0.04, 0.3, tw, 0, 0.44, z)); for (const x of [-0.8, 0.8]) tbl.add(box(0.05, 0.44, 0.26, tw, x, 0.22, z)); }
  tbl.position.set(-1.2, 0, 1.6); g.add(tbl);
  g.userData.table = { x: -1.2, z: 1.6, y: 0.745 };
  g.userData.colliders = [[-W / 2, W / 2, -D, 0.12], [2.83, 3.87, 0.04, 0.78], [-2.15, -0.25, 0.95, 2.25]];
  g.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  return g;
}
