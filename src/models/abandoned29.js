// Abandoned office (queue item 29, photos/grime/): a vacant ground-floor unit that shows off the grime
// surfaces. All signs are made up; no phone numbers.
//   makeAbandonedOffice()
//     front      grimy storefront glass with a FOR LEASE poster, a door left ajar, a tan painted fascia
//                (smooth tan from the photo) with the ghost outline of the old shop letters
//     floor      bare water-stained particleboard sheets (two photos), a torn strip of old carpet
//     walls      orange-peel drywall: plain on the left with a chipped + patched patch, stained on the
//                back, the right wall painted mottled tan; a washroom alcove in the back corner lined with
//                grimy white tile (the photo's, hair and all) with a sink
//     ceiling    a 600 mm drop ceiling: damaged acoustic tiles (photo) on a rusty T-bar grid (photo), some
//                tiles missing to the dark plenum and ducts, two sagging, one broken on the floor
//     back door  black steel with white paint chipping off (photo), push bar, a dead EXIT sign
//     props      plain pine boards leaning on the wall and on a sawhorse, an old office chair, a bucket,
//                scattered paper, a fluorescent fitting hanging by one chain
// Faces +z (street side), origin at floor level in the middle of the front. Room: x -3.5..3.5, z 0..-6.
// userData: colliders [[x0,x1,z0,z1]], areas [{minX..}] (room + doorway)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
const _c = new Map();
function base(name, srgb) {
  const k = name + srgb;
  if (!_c.has(k)) { const t = _L.load(`assets/textures/${name}.png`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; _c.set(k, t); }
  return _c.get(k);
}
// a material whose textures repeat every `unit` metres on a w x h face (own texture objects; the browser cache
// shares the image download)
THREE.Cache.enabled = true;
function surf(name, w, h, unit, { normal = false, ns = 0.8, rough = 0.9, color = '#ffffff' } = {}) {
  const ld = (n, srgb) => { const t = _L.load(`assets/textures/${n}.png`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / unit, h / unit); t.anisotropy = 8; return t; };
  const m = new THREE.MeshStandardMaterial({ roughness: rough, color, map: ld(name, true) });
  if (normal) { m.normalMap = ld(name + '_n', false); m.normalScale.set(ns, ns); }
  return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.75, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
function plane(w, h, mat, x, y, z, ry = 0, rx = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; return m; }
function tube(a, b, r, mat, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.castShadow = true; return m; }

export function makeAbandonedOffice() {
  const g = new THREE.Group(); g.name = 'abandoned_office';
  const W = 7, HW = W / 2, D = 6, CH = 2.7, SLAB = 3.5;
  const colliders = [];
  const col = (x0, x1, z0, z1) => colliders.push([x0, x1, z0, z1]);

  // ---------------------------------------------------------------- floor: particleboard sheets 1.2 x 2.4
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
    const x0 = -HW + i * 1.2, x1 = Math.min(HW, x0 + 1.2), z0 = -j * 2.4, z1 = Math.max(-D, z0 - 2.4);
    if (x1 <= x0 || z1 >= z0) continue;
    const m = surf((i + j) % 2 ? 'ab_particle' : 'ab_particle2', x1 - x0, z0 - z1, 1.2, { rough: 0.95 });
    m.color.setScalar(0.92 + ((i * 7 + j * 3) % 5) * 0.03);
    g.add(plane(x1 - x0 - 0.004, z0 - z1 - 0.004, m, (x0 + x1) / 2, 0.003, (z0 + z1) / 2, 0, -Math.PI / 2));
  }
  // a torn strip of old grey carpet left by the front, with a frayed edge
  const ct = canvasTex(256, 256, (c, w, h) => { const r = rng(4); c.fillStyle = '#5a5c60'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '30,30,34' : '130,130,136'},0.25)`; c.fillRect(r() * w, r() * h, 1, 1); } c.clearRect(0, h - 30, w, 30); for (let x = 0; x < w; x += 6) c.fillRect(x, h - 30, 4, r() * 26); });
  g.add(plane(2.6, 0.9, std({ map: ct, transparent: true, alphaTest: 0.4, roughness: 1 }), -1.4, 0.008, -0.6, 0, -Math.PI / 2));

  // ---------------------------------------------------------------- walls
  // left (x = -HW): plain orange-peel with a chipped + patched area; back: stained; right: mottled tan paint
  g.add(plane(D, CH, surf('ab_peel', D, CH, 1.0, { normal: true }), -HW, CH / 2, -D / 2, Math.PI / 2));
  g.add(plane(1.3, 0.9, surf('ab_peel_chip', 1.3, 0.9, 1.0, { normal: true }), -HW + 0.004, 1.0, -2.2, Math.PI / 2));
  // patch: a squarer, flatter rectangle of fresh compound that was never painted
  g.add(plane(0.42, 0.3, std({ color: '#efeee8', roughness: 0.6 }), -HW + 0.006, 1.15, -2.5, Math.PI / 2));
  g.add(plane(W, CH, surf('ab_peel_stain', W, CH, 1.4, { normal: true }), 0, CH / 2, -D, 0));
  g.add(plane(D, CH, surf('ab_tan_mottled', D, CH, 1.6), HW, CH / 2, -D / 2, -Math.PI / 2));
  // pale shadow rectangles where furniture and a whiteboard used to hang
  g.add(plane(1.8, 1.0, std({ color: '#cbb89a', roughness: 0.9, transparent: true, opacity: 0.35 }), HW - 0.004, 1.5, -3.6, -Math.PI / 2));
  for (const [x, y] of [[-1.0, 1.55], [0.8, 1.55]]) { const h = new THREE.Mesh(new THREE.CircleGeometry(0.006, 8), std({ color: '#2a2622' })); h.position.set(x, y, -D + 0.003); g.add(h); }
  // skirting: black rubber cove base, peeling in places
  for (const [w, x, z, ry] of [[D, -HW + 0.006, -D / 2, Math.PI / 2], [W, 0, -D + 0.006, 0], [D, HW - 0.006, -D / 2, -Math.PI / 2]]) g.add(plane(w, 0.1, std({ color: '#1e1e1e', roughness: 0.6 }), x, 0.05, z, ry));
  col(-HW - 0.3, -HW + 0.05, -D, 0); col(HW - 0.05, HW + 0.3, -D, 0); col(-HW, HW, -D - 0.3, -D + 0.05);

  // ---------------------------------------------------------------- washroom alcove (back right): tiled, with a sink
  {
    const ax0 = HW - 1.8, az0 = -D + 1.8;
    // partition walls (drywall outside, tile inside to 1.5 m)
    g.add(box(0.1, CH, 1.0, surf('ab_peel2', 1.0, CH, 1.0, { normal: true }), ax0, CH / 2, -D + 0.5));   // with a 0.8 m door gap at z -D+1..-D+1.8
    g.add(box(1.8, CH, 0.1, surf('ab_peel2', 1.8, CH, 1.0, { normal: true }), HW - 0.9, CH / 2, az0));
    g.add(box(0.1, CH - 2.1, 0.8, surf('ab_peel2', 0.8, CH - 2.1, 1.0, { normal: true }), ax0, 2.1 + (CH - 2.1) / 2, -D + 1.4));
    g.add(box(0.12, 0.05, 0.84, std({ color: '#6a5a48', roughness: 0.7 }), ax0, 2.1, -D + 1.4));
    for (const [w, x, z, ry] of [[1.8, HW - 0.9, -D + 0.01, 0], [1.7, HW - 0.01, -D + 0.9, -Math.PI / 2], [1.0, ax0 + 0.051, -D + 0.5, Math.PI / 2]]) g.add(plane(w, 1.5, surf('ab_tile', w, 1.5, 0.6, { rough: 0.25 }), x, 0.75, z, ry));
    const fl = plane(1.7, 1.7, std({ color: '#cfccc4', roughness: 0.5 }), HW - 0.9, 0.006, -D + 0.9, 0, -Math.PI / 2); g.add(fl);
    // wall-hung sink with a rusty drip stain and a dead tap
    const sink = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.16, 0.38, 3, 0.04), std({ color: '#f0eee8', roughness: 0.3 })); sink.position.set(HW - 0.35, 0.8, -D + 0.9); sink.rotation.y = -Math.PI / 2; g.add(sink);
    g.add(box(0.06, 0.006, 0.12, std({ color: '#a8642a', roughness: 0.6 }), HW - 0.3, 0.885, -D + 0.9));
    g.add(tube(V(HW - 0.06, 0.95, -D + 0.9), V(HW - 0.2, 0.97, -D + 0.9), 0.012, std({ color: '#b8bcbe', metalness: 0.8, roughness: 0.3 })));
    g.add(tube(V(HW - 0.1, 0.72, -D + 0.9), V(HW - 0.1, 0.25, -D + 0.9), 0.016, std({ color: '#c8c8c4', metalness: 0.6 })));
    // a cracked mirror outline (just the clips + a darker rectangle where it hung)
    g.add(plane(0.45, 0.6, std({ color: '#d8d4cc', roughness: 0.4 }), HW - 0.012, 1.6, -D + 0.9, -Math.PI / 2));
    col(ax0 - 0.05, HW, -D, -D + 1.0); col(ax0 - 0.05, HW, az0 - 0.05, az0 + 0.05);
  }

  // ---------------------------------------------------------------- drop ceiling: rusty grid + damaged tiles
  {
    const rust = base('ab_ceil_rust', true);
    const gridM = std({ map: rust, roughness: 0.7, metalness: 0.2 });
    const tileGeo = new THREE.PlaneGeometry(0.595, 0.595);
    const ceilMats = [0, 1, 2].map((k) => { const m = std({ map: base('ab_ceil', true), normalMap: base('ab_ceil_n', false), roughness: 0.95 }); m.color.setScalar(0.88 + k * 0.05); return m; });
    const r = rng(29);
    const missing = new Set(['2,3', '3,3', '7,6', '9,2']), sag = new Set(['5,4', '1,7']);
    let fallen = null;
    for (let i = 0; i < 11; i++) for (let j = 0; j < 10; j++) {
      const x = -HW + 0.3 + i * 0.6 + 0.05, z = -0.3 - j * 0.6;
      if (x > HW - 0.25 || z < -D + 0.25) continue;
      const key = `${i},${j}`;
      if (missing.has(key)) { if (!fallen) fallen = [x, z]; continue; }
      const t = new THREE.Mesh(tileGeo, ceilMats[Math.floor(r() * 3)]);
      t.rotation.x = Math.PI / 2; t.rotation.z = Math.floor(r() * 4) * Math.PI / 2;
      t.position.set(x, CH, z);
      if (sag.has(key)) { t.rotation.x += 0.12; t.position.y -= 0.035; }
      // water-stain rings on a few tiles
      g.add(t);
      if (r() < 0.12) { const st = new THREE.Mesh(new THREE.CircleGeometry(0.15 + r() * 0.1, 24), std({ color: '#8a6a3a', transparent: true, opacity: 0.35, roughness: 1 })); st.rotation.x = Math.PI / 2; st.position.set(x + (r() - 0.5) * 0.2, CH - 0.003, z + (r() - 0.5) * 0.2); g.add(st); }
    }
    // T-bar grid: main runners along z, cross tees along x, all 24 mm wide and rusty
    const runM = surf('ab_ceil_rust', 1, D, 1.5, { rough: 0.7 }); runM.map.repeat.set(1, D / 1.5);
    for (let i = 0; i <= 11; i++) { const x = -HW + 0.05 + i * 0.6; if (x > HW) continue; g.add(box(0.024, 0.035, D, runM, x, CH - 0.002, -D / 2)); }
    for (let j = 0; j <= 10; j++) { const z = -j * 0.6; if (z < -D) continue; g.add(box(W, 0.03, 0.024, gridM, 0, CH - 0.001, z)); }
    // plenum above: dark slab, a duct and a cable tray seen through the gaps
    g.add(plane(W, D, std({ color: '#2a2724', roughness: 1 }), 0, SLAB, -D / 2, 0, Math.PI / 2));
    g.add(box(0.5, 0.3, D, std({ color: '#7a7c7e', metalness: 0.5, roughness: 0.5 }), -1.2, SLAB - 0.35, -D / 2));
    g.add(box(0.3, 0.05, D, std({ color: '#5a5c5e', metalness: 0.5 }), 1.4, SLAB - 0.25, -D / 2));
    for (let k = 0; k < 4; k++) g.add(tube(V(1.3 + k * 0.05, SLAB - 0.22, 0), V(1.32 + k * 0.05, SLAB - 0.22, -D), 0.01, std({ color: k % 2 ? '#1a1a1a' : '#d8d4c8' }), 5));
    // hanger wires
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.add(tube(V(-2.95 + i * 2.4, CH, -0.9 - j * 2), V(-2.95 + i * 2.4, SLAB, -0.9 - j * 2), 0.0015, std({ color: '#8a8a8a' }), 3));
    // the fallen tile, broken in two on the floor below a gap, with crumbs
    const [fx, fz] = fallen;
    for (const [dx, dz, w2, ry] of [[-0.08, 0.05, 0.36, 0.3], [0.22, -0.12, 0.26, -0.5]]) { const p = box(w2, 0.016, 0.42, std({ map: base('ab_ceil', true), roughness: 0.95 }), fx + dx, 0.012, fz + dz); p.rotation.y = ry; p.rotation.z = 0.05; g.add(p); }
    const cr = rng(3); for (let k = 0; k < 30; k++) { const c = box(0.01 + cr() * 0.03, 0.006, 0.01 + cr() * 0.03, std({ color: '#d8d2c4' }), fx + (cr() - 0.5) * 0.8, 0.006, fz + (cr() - 0.5) * 0.8); c.rotation.y = cr() * 3; g.add(c); }
    // the fluorescent fitting: one end still on the grid, the other hanging on a chain
    const fit = new THREE.Group();
    fit.add(box(0.3, 0.08, 1.2, std({ color: '#d8d6d0', roughness: 0.5 })));
    fit.add(box(0.26, 0.02, 1.16, std({ color: '#f2f2ec', emissive: '#dfe8ff', emissiveIntensity: 0.25 }), 0, -0.045, 0));
    fit.position.set(1.0, CH - 0.32, -3.0); fit.rotation.x = 0.55; g.add(fit);
    g.add(tube(V(1.0, CH, -3.45), V(1.0, CH - 0.62, -3.5), 0.004, std({ color: '#777', metalness: 0.6 }), 4));
    const fl = new THREE.PointLight('#cfe0ff', 2.6, 7, 1.5); fl.position.set(1.0, CH - 0.6, -3.0); g.add(fl);
  }

  // ---------------------------------------------------------------- back door: black steel, chipped white paint
  {
    const d = new THREE.Group();
    d.add(box(0.95, 2.1, 0.05, surf('ab_chip_metal', 0.95, 2.1, 0.9, { normal: true, rough: 0.6 }), 0, 1.05, 0));
    for (const s of [-1, 1]) d.add(box(0.06, 2.16, 0.12, std({ color: '#202020', metalness: 0.4 }), s * 0.505, 1.08, 0));
    d.add(box(1.07, 0.06, 0.12, std({ color: '#202020', metalness: 0.4 }), 0, 2.16, 0));
    d.add(box(0.7, 0.05, 0.05, std({ color: '#b8bcbe', metalness: 0.8, roughness: 0.3 }), 0, 1.0, 0.06));
    const ex = canvasTex(256, 96, (c, w, h) => { c.fillStyle = '#e8e6e0'; c.fillRect(0, 0, w, h); c.fillStyle = '#5a7a5a'; fitText(c, 'EXIT', w / 2, h / 2 + 2, w - 40, 64, F.label, { spacing: 10 }); });
    d.add(box(0.36, 0.14, 0.06, std({ color: '#e8e6e0' }), 0, 2.4, 0.03)); d.add(plane(0.34, 0.12, std({ map: ex }), 0, 2.4, 0.061));
    d.position.set(-1.6, 0, -D + 0.03); g.add(d);
  }

  // ---------------------------------------------------------------- props
  {
    const pine = (len) => surf('ab_wood', 0.14, len, 0.6, { rough: 0.8 });
    // boards leaning against the left wall
    for (let k = 0; k < 5; k++) { const b = box(0.02, 2.4, 0.14, pine(2.4), -HW + 0.2 + k * 0.025, 1.17, -3.6 - k * 0.16); b.rotation.z = 0.1 + k * 0.012; b.rotation.y = (k - 2) * 0.03; g.add(b); }
    col(-HW, -HW + 0.5, -4.4, -3.4);
    // sawhorse with a board across it
    const sh = new THREE.Group();
    sh.add(box(1.1, 0.09, 0.09, pine(1.1), 0, 0.72, 0));
    for (const x of [-0.45, 0.45]) for (const s of [-1, 1]) { const l = box(0.05, 0.78, 0.05, pine(0.78), x, 0.36, s * 0.14); l.rotation.x = s * 0.2; sh.add(l); }
    const board = box(2.2, 0.025, 0.2, pine(2.2), 0.3, 0.78, 0.02); board.rotation.y = 0.15; sh.add(board);
    sh.position.set(-1.0, 0, -2.9); sh.rotation.y = 0.3; g.add(sh);
    col(-2.2, 0.2, -3.4, -2.4);
    // old office chair, tipped back against the right wall, foam showing
    const chair = new THREE.Group();
    const fab = std({ color: '#3a3e48', roughness: 0.95 });
    chair.add(new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.08, 0.46, 3, 0.03), fab).translateY(0.46));
    const back = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.5, 0.07, 3, 0.03), fab); back.position.set(0, 0.78, -0.22); back.rotation.x = -0.15; chair.add(back);
    chair.add(new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), std({ color: '#e8d488', roughness: 1 })).translateY(0.502).rotateX(-Math.PI / 2));
    chair.add(tube(V(0, 0.42, 0), V(0, 0.12, 0), 0.025, std({ color: '#2a2a2a', metalness: 0.6 })));
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 0.4; chair.add(tube(V(0, 0.1, 0), V(Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3), 0.015, std({ color: '#1a1a1a' }))); const w = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), std({ color: '#111' })); w.position.set(Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3); chair.add(w); }
    chair.position.set(2.6, 0, -1.6); chair.rotation.y = -2.2; g.add(chair);
    col(2.25, 2.95, -1.95, -1.25);
    // bucket with dried compound, scattered paper
    const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.36, 24, 1, true), std({ color: '#e8e4dc', roughness: 0.6, side: THREE.DoubleSide })); bk.position.set(-2.9, 0.18, -5.3); g.add(bk);
    g.add(new THREE.Mesh(new THREE.CircleGeometry(0.14, 24), std({ color: '#cfcac0' })).translateX(-2.9).translateY(0.2).translateZ(-5.3).rotateX(-Math.PI / 2));
    const pr = rng(11);
    for (let k = 0; k < 14; k++) { const p = plane(0.21, 0.297, std({ color: pr() < 0.3 ? '#e8dcb8' : '#f2f0ea', roughness: 0.9, side: THREE.DoubleSide }), (pr() - 0.5) * 5.5, 0.01 + k * 0.0004, -0.6 - pr() * 4.6, 0, -Math.PI / 2); p.rotation.z = pr() * 3; g.add(p); }
  }

  // ---------------------------------------------------------------- front: glazing, door ajar, fascia, FOR LEASE
  {
    const alu = std({ color: '#8a8e90', metalness: 0.5, roughness: 0.45 });
    const grime = canvasTex(512, 512, (c, w, h) => { const r = rng(7); c.fillStyle = 'rgba(160,150,130,0.18)'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const gr = c.createLinearGradient(0, 0, 0, h); const x = r() * w; gr.addColorStop(0, 'rgba(90,80,60,0)'); gr.addColorStop(1, `rgba(90,80,60,${0.15 + r() * 0.2})`); c.fillStyle = gr; c.fillRect(x, r() * h * 0.6, 4 + r() * 20, h); } });
    const glass = new THREE.MeshStandardMaterial({ map: grime, color: '#c8d4d8', transparent: true, opacity: 0.55, roughness: 0.3, depthWrite: false, side: THREE.DoubleSide });
    // panes: x -3.5..-0.6 and 0.6..3.5; door 1.2 m wide in the middle
    for (const [a, b] of [[-HW, -0.6], [0.6, HW]]) g.add(plane(b - a, CH - 0.15, glass, (a + b) / 2, 0.1 + (CH - 0.15) / 2, 0.02));
    for (const x of [-HW, -2.0, -0.6, 0.6, 2.0, HW]) g.add(box(0.07, CH + 0.1, 0.1, alu, x, (CH + 0.1) / 2, 0.02));
    g.add(box(W, 0.1, 0.12, alu, 0, 0.05, 0.02)); g.add(box(W, 0.08, 0.12, alu, 0, CH + 0.06, 0.02));
    // door leaf ajar inward
    const dl = new THREE.Group();
    dl.add(box(1.16, CH - 0.1, 0.04, glass, 0.58, (CH - 0.1) / 2 + 0.03, 0));
    for (const [w, h, x, y] of [[0.06, CH - 0.1, 0.03, (CH - 0.1) / 2], [0.06, CH - 0.1, 1.13, (CH - 0.1) / 2], [1.16, 0.06, 0.58, CH - 0.1], [1.16, 0.12, 0.58, 0.06]]) dl.add(box(w, h, 0.05, alu, x, y, 0));
    dl.add(box(0.03, 0.5, 0.05, alu, 1.0, 1.05, -0.05));
    dl.position.set(-0.6, 0, 0.0); dl.rotation.y = 0.9; g.add(dl);
    col(-0.65, -0.3, -0.45, 0.02); col(-0.3, 0.12, -0.95, -0.45);
    // FOR LEASE poster taped inside the left pane
    const fl = canvasTex(384, 512, (c, w, h) => {
      c.fillStyle = '#f6f4ee'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#c8202a'; c.fillRect(0, 0, w, 120); c.fillStyle = '#fff'; fitText(c, 'FOR LEASE', w / 2, 62, w - 40, 76, F.heavy, { spacing: 4 });
      c.fillStyle = '#222'; fitText(c, 'RETAIL / OFFICE', w / 2, 170, w - 60, 40, F.label, { spacing: 3 });
      fitText(c, '68 m²  ·  ground floor', w / 2, 230, w - 60, 34, F.label);
      fitText(c, 'Maple Creek Properties', w / 2, 330, w - 50, 36, F.roman);
      c.fillStyle = '#777'; fitText(c, 'enquire at the office', w / 2, 400, w - 80, 28, F.label);
      c.fillStyle = 'rgba(200,170,90,0.4)'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(220,200,150,0.7)'; c.fillRect(20, 0, 70, 24); c.fillRect(w - 90, 0, 70, 24);
    });
    g.add(plane(0.58, 0.78, std({ map: fl, roughness: 0.9, side: THREE.DoubleSide }), -1.6, 1.4, 0.01));
    // fascia: smooth tan paint with the ghost of the old letters
    const fx = canvasTex(1024, 128, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(120,100,70,0.28)'; fitText(c, 'HARBOR DENTAL CARE', w / 2, h / 2, w - 100, 80, F.roman, { spacing: 14 }); c.fillStyle = 'rgba(60,50,40,0.5)'; for (let i = 0; i < 18; i++) c.fillRect(80 + i * 48, 30, 4, 4); });
    const fas = surf('ab_tan_smooth', W + 0.4, SLAB - CH + 0.6, 1.4);
    g.add(box(W + 0.4, SLAB - CH + 0.6, 0.3, fas, 0, CH + (SLAB - CH + 0.6) / 2, 0.1));
    g.add(plane(W - 0.6, 0.6, new THREE.MeshBasicMaterial({ map: fx, transparent: true }), 0, CH + 0.5, 0.252));
    // the rest of the building: tan render block above and around
    const shell = surf('ab_tan_mottled', W + 0.4, 6.5, 2.0);
    g.add(box(W + 0.4, 3.3, D + 0.3, shell, 0, SLAB + 0.6 + 1.65, -D / 2 - 0.05));
    for (const s of [-1, 1]) g.add(box(0.2, SLAB + 0.6, D + 0.3, shell, s * (HW + 0.13), (SLAB + 0.6) / 2, -D / 2 - 0.05));
    g.add(box(W + 0.46, SLAB + 0.6, 0.2, shell, 0, (SLAB + 0.6) / 2, -D - 0.13));
    // street light through the glass + a dim fill so the room reads
    const sl = new THREE.PointLight('#ffe2b0', 2.2, 7, 1.5); sl.position.set(0, 2.0, -0.8); g.add(sl);
    const bl = new THREE.PointLight('#d8e0ec', 1.2, 4, 1.6); bl.position.set(HW - 0.9, 2.2, -D + 0.9); g.add(bl);
  }

  g.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  g.userData.colliders = colliders;
  g.userData.areas = [{ minX: -HW + 0.3, maxX: HW - 0.3, minZ: -D + 0.3, maxZ: -0.2 }, { minX: -0.1, maxX: 0.5, minZ: -0.6, maxZ: 0.8 }];
  return g;
}
