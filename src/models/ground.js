// Ground dressing from the rocks / grass / leaf photos:
//   rock beds of 3D river stones (colours sampled from the river-rock photo),
//   dry grass tufts (blade colours from the tuft photos), curbs with leaf
//   litter piled in the gutter, loose oak leaves, and the teal bike rack.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
function tex(name, color = true) {
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Seeded random so the world looks the same every load.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Rock colours picked from the river-rock photo (cool greys, tans, a few pinkish).
const ROCK_COLORS = ['#8c8a86', '#a39e95', '#6f6d6a', '#b8b0a2', '#7d7671', '#9a8f86', '#5d5b59', '#c2bbb0', '#8f8378', '#a8978c', '#77706b', '#9c968f'];
// Dry grass colours from the tuft photos.
const GRASS_COLORS = ['#58492e', '#817456', '#ac9f7f', '#c7bb9b'];

// One smooth, rounded river stone: an indexed sphere (so normals stay smooth)
// pushed in and out by a few low-frequency bumps, then flattened.
function pebbleGeometry(seed) {
  const r = rng(seed);
  const g = new THREE.SphereGeometry(1, 14, 10);
  const p = g.attributes.position;
  const bumps = Array.from({ length: 4 }, () => [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, (r() - 0.5) * 0.35]);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let k = 1;
    for (const [bx, by, bz, a] of bumps) k += a * Math.max(0, v.x * bx + v.y * by + v.z * bz);
    p.setXYZ(i, v.x * k, v.y * k * 0.55, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

// A bed of river rock filling the rectangle [x0,x1] x [z0,z1].
export function makeRockBed(x0, x1, z0, z1, { density = 140, seed = 1 } = {}) {
  const g = new THREE.Group();
  g.name = 'river_rock_bed';
  const r = rng(seed);
  // dark ground between the stones, with the photo texture for fine gravel
  const base = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0),
    new THREE.MeshStandardMaterial({ map: tex('river_rock.png'), color: '#6a655f', roughness: 1 }));
  base.material.map.repeat.set((x1 - x0) / 0.8, (z1 - z0) / 0.8);
  base.rotation.x = -Math.PI / 2;
  base.position.set((x0 + x1) / 2, 0.004, (z0 + z1) / 2);
  base.receiveShadow = true;
  g.add(base);
  const n = Math.round((x1 - x0) * (z1 - z0) * density);
  const grain = tex('river_rock.png');
  grain.repeat.set(0.6, 0.6);
  const grainN = tex('river_rock_normal.png', false);
  grainN.repeat.set(0.6, 0.6);
  // photo grain on every stone: speckle (map, kept pale so instance colours still show) + pitting
  const mat = new THREE.MeshStandardMaterial({ map: grain, normalMap: grainN, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.7, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>',
      '#ifdef USE_MAP\n vec4 texelColor = texture2D( map, vMapUv ); float l = dot(texelColor.rgb, vec3(0.299,0.587,0.114)); diffuseColor.rgb *= mix(0.7, 1.25, l);\n#endif');
  };
  const geos = [pebbleGeometry(seed), pebbleGeometry(seed + 7), pebbleGeometry(seed + 13)];
  const per = Math.ceil(n / geos.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), v = new THREE.Vector3();
  const c = new THREE.Color();
  for (const geo of geos) {
    const inst = new THREE.InstancedMesh(geo, mat, per);
    for (let i = 0; i < per; i++) {
      const size = 0.025 + Math.pow(r(), 2.2) * 0.09;   // mostly small, a few big
      s.set(size * (0.8 + r() * 0.5), size, size * (0.8 + r() * 0.5));
      e.set((r() - 0.5) * 0.4, r() * Math.PI * 2, (r() - 0.5) * 0.4);
      q.setFromEuler(e);
      v.set(x0 + r() * (x1 - x0), size * 0.3, z0 + r() * (z1 - z0));
      inst.setMatrixAt(i, m4.compose(v, q, s));
      c.set(ROCK_COLORS[Math.floor(r() * ROCK_COLORS.length)]).multiplyScalar(0.7 + r() * 0.3);
      inst.setColorAt(i, c);
    }
    inst.castShadow = inst.receiveShadow = true;
    g.add(inst);
  }
  return g;
}

// A dry grass tuft: ~110 thin tapered blades arching out from a tight base.
function tuftGeometry(seed) {
  const r = rng(seed);
  const pos = [], col = [];
  const c = new THREE.Color();
  for (let b = 0; b < 110; b++) {
    const ang = r() * Math.PI * 2;
    const lean = Math.pow(r(), 0.7) * 0.9;           // outer blades lean more
    const len = 0.28 + r() * 0.22;
    const w = 0.006 + r() * 0.004;
    const bx = Math.cos(ang) * 0.03 * r(), bz = Math.sin(ang) * 0.03 * r();
    const segs = 4;
    const pts = [];
    for (let k = 0; k <= segs; k++) {
      const t = k / segs;
      const out = Math.sin(lean) * len * t * t * 1.1;
      pts.push([bx + Math.cos(ang) * out, Math.cos(lean * t) * len * t, bz + Math.sin(ang) * out]);
    }
    const sideX = -Math.sin(ang) * w, sideZ = Math.cos(ang) * w;
    const tone = GRASS_COLORS[Math.min(3, Math.floor(r() * 4))];
    for (let k = 0; k < segs; k++) {
      const [a, b2] = [pts[k], pts[k + 1]];
      const wa = 1 - k / segs, wb = 1 - (k + 1) / segs;
      const quad = [
        [a[0] - sideX * wa, a[1], a[2] - sideZ * wa], [a[0] + sideX * wa, a[1], a[2] + sideZ * wa],
        [b2[0] + sideX * wb, b2[1], b2[2] + sideZ * wb], [b2[0] - sideX * wb, b2[1], b2[2] - sideZ * wb],
      ];
      for (const idx of [0, 1, 2, 0, 2, 3]) {
        pos.push(...quad[idx]);
        // darker at the base, paler toward the tips (sun-bleached)
        const t = (idx < 2 ? k : k + 1) / segs;
        c.set(tone).lerp(new THREE.Color('#d6cbac'), t * 0.35).multiplyScalar(0.55 + 0.45 * t);
        col.push(c.r, c.g, c.b);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

const grassMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.9 });
export function makeGrassTufts(spots, seed = 3) {
  const g = new THREE.Group();
  g.name = 'dry_grass_tufts';
  const geos = [tuftGeometry(seed), tuftGeometry(seed + 1), tuftGeometry(seed + 2)];
  const r = rng(seed + 9);
  spots.forEach(([x, z], i) => {
    const m = new THREE.Mesh(geos[i % 3], grassMat);
    const k = 0.75 + r() * 0.6;
    m.scale.set(k * (0.9 + r() * 0.3), k, k * (0.9 + r() * 0.3));
    m.rotation.y = r() * Math.PI * 2;
    m.position.set(x, 0, z);
    m.castShadow = true;
    g.add(m);
  });
  return g;
}

// Concrete curb along x from x0 to x1 at z = zc, street side toward +dir (z),
// with gutter leaf litter in drifts.
export function makeCurbWithLeaves(x0, x1, zc, { dir = -1, seed = 5 } = {}) {
  const g = new THREE.Group();
  g.name = 'curb_with_leaves';
  const L = x1 - x0;
  const curbMat = new THREE.MeshStandardMaterial({ color: '#a7a49d', roughness: 0.9 });
  const curb = new THREE.Mesh(new THREE.BoxGeometry(L, 0.15, 0.18), curbMat);
  curb.position.set((x0 + x1) / 2, 0.075, zc);
  curb.castShadow = curb.receiveShadow = true;
  g.add(curb);
  // gutter pan
  const gutter = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.45), new THREE.MeshStandardMaterial({ color: '#7d7b77', roughness: 0.95 }));
  gutter.rotation.x = -Math.PI / 2;
  gutter.position.set((x0 + x1) / 2, 0.005, zc + dir * 0.31);
  g.add(gutter);
  // leaf drifts: strip texture, densest edge against the curb
  const stripTex = tex('leaf_strip.png');
  const r = rng(seed);
  let x = x0 + r() * 1.5;
  while (x < x1 - 1) {
    const len = 1.2 + r() * 3.5;
    const w = 0.35 + r() * 0.35;
    const t = stripTex.clone();
    t.needsUpdate = true;
    t.repeat.set(len / 2.4, 1);
    t.offset.set(r(), 0);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(len, x1 - x), w),
      new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.35, roughness: 1, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    if (dir > 0) m.rotation.z = Math.PI; // keep the dense edge at the curb
    m.position.set(x + Math.min(len, x1 - x) / 2, 0.012, zc + dir * (0.09 + w / 2));
    m.renderOrder = 1;
    g.add(m);
    x += len + 0.5 + r() * 3;
  }
  return g;
}

// Single oak leaves blown around a rectangle.
export function makeLooseLeaves(x0, x1, z0, z1, n = 40, seed = 11) {
  const t = tex('oak_leaf.png');
  const mat = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1 });
  const geo = new THREE.PlaneGeometry(0.11, 0.13);
  geo.rotateX(-Math.PI / 2);
  const inst = new THREE.InstancedMesh(geo, mat, n);
  const r = rng(seed);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.3, r() * Math.PI * 2, (r() - 0.5) * 0.3));
    const k = 0.7 + r() * 0.6;
    inst.setMatrixAt(i, m4.compose(v.set(x0 + r() * (x1 - x0), 0.013 + r() * 0.004, z0 + r() * (z1 - z0)), q, s.set(k, k, k)));
    c.setHSL(0.07 + r() * 0.03, 0.5 + r() * 0.3, 0.55 + r() * 0.2); // tan to orange-brown
    inst.setColorAt(i, c);
  }
  inst.name = 'loose_oak_leaves';
  return inst;
}

// Teal wave bike rack (curb photo): a row of U hoops on a base rail.
export function makeBikeRack(n = 5) {
  const g = new THREE.Group();
  g.name = 'bike_rack';
  const teal = new THREE.MeshStandardMaterial({ color: '#2b8a86', roughness: 0.45, metalness: 0.4 });
  for (let i = 0; i < n; i++) {
    const path = new THREE.CurvePath();
    const x = i * 0.75;
    const a = new THREE.Vector3(x, 0, -0.3), b = new THREE.Vector3(x, 0.7, -0.3), c = new THREE.Vector3(x, 0.7, 0.3), d = new THREE.Vector3(x, 0, 0.3);
    path.add(new THREE.LineCurve3(a, new THREE.Vector3(x, 0.55, -0.3)));
    path.add(new THREE.CubicBezierCurve3(new THREE.Vector3(x, 0.55, -0.3), b, c, new THREE.Vector3(x, 0.55, 0.3)));
    path.add(new THREE.LineCurve3(new THREE.Vector3(x, 0.55, 0.3), d));
    const m = new THREE.Mesh(new THREE.TubeGeometry(path, 40, 0.024, 10, false), teal);
    m.castShadow = true;
    g.add(m);
  }
  for (const z of [-0.3, 0.3]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.75 * (n - 1) + 0.1, 0.03, 0.06), teal);
    rail.position.set(0.75 * (n - 1) / 2, 0.015, z);
    g.add(rail);
  }
  return g;
}
