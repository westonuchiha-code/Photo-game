// Trees from the bark / tree photos. Each tree is generated from a seed:
// a trunk with a root flare, recursive branches (tubes sharing the bark
// material), and foliage. Bark textures wrap once around and repeat every
// ~1 m up the trunk, so they keep the real scale of the photos.
//   spruce  - tall cone of drooping needle sprays, holiday string lights (spruce photos)
//   cherry  - smooth grey bark with ring marks, a big knot, thin late-autumn crown
//   pale    - pale flaky-bark street tree, mostly bare, in a leaf-filled pit
//   oak     - deep-furrowed dark bark street tree, a few brown leaves left
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const loader = new THREE.TextureLoader();
const texCache = new Map();
function tex(name, color = true) {
  if (texCache.has(name)) return texCache.get(name);
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(name, t);
  return t;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const barkMats = {};
function barkMat(kind) {
  if (barkMats[kind]) return barkMats[kind];
  barkMats[kind] = new THREE.MeshStandardMaterial({
    map: tex(`bark_${kind}.png`), normalMap: tex(`bark_${kind}_normal.png`, false),
    normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.95,
  });
  return barkMats[kind];
}

// A tapered limb along a curve. UVs: u wraps around once, v = metres / 1.0.
function limb(curve, r0, r1, radial = 10, segs = 12, flare = null) {
  const geo = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  const pos = geo.attributes.position, uv = geo.attributes.uv, nrm = geo.attributes.normal;
  const len = curve.getLength();
  const p = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const t = uv.getY(i) === undefined ? 0 : uv.getX(i);   // TubeGeometry: u = along, v = around
    const ring = uv.getY(i);
    curve.getPointAt(Math.min(1, t), c);
    p.fromBufferAttribute(pos, i).sub(c);                 // unit-radius offset from the centre line
    let r = r0 + (r1 - r0) * t;
    if (flare) r *= flare(t, ring);
    p.multiplyScalar(r).add(c);
    pos.setXYZ(i, p.x, p.y, p.z);
    uv.setXY(i, ring * Math.max(1, Math.round(r0 * 6)), (t * len) / 1.0);
  }
  geo.computeVertexNormals();
  return geo;
}

// Recursive branching: returns geometries for all limbs, and the tip points
// (with direction) where foliage goes.
function grow(r, start, dir, length, radius, depth, opts, out) {
  const { bend = 0.25, spread = 0.7, children = 3, lift = 0.15 } = opts;
  const pts = [start.clone()];
  const d = dir.clone();
  const p = start.clone();
  for (let k = 1; k <= 4; k++) {
    d.add(new THREE.Vector3((r() - 0.5) * bend, lift * 0.3 + (r() - 0.5) * bend * 0.5, (r() - 0.5) * bend)).normalize();
    p.addScaledVector(d, length / 4);
    pts.push(p.clone());
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  out.geos.push(limb(curve, radius, radius * 0.55, depth > 1 ? 9 : 5, depth > 1 ? 10 : 5));
  if (depth <= 0 || radius < 0.012) {
    out.tips.push({ p: p.clone(), d: d.clone(), r: radius });
    return;
  }
  const n = children + (r() < 0.4 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const t = 0.45 + 0.55 * ((i + r() * 0.6) / n);
    const at = curve.getPointAt(t);
    const a = r() * Math.PI * 2;
    const side = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const nd = dir.clone().multiplyScalar(1 - spread).addScaledVector(side, spread).normalize();
    nd.y = Math.max(nd.y, opts.minUp ?? 0.15);
    nd.normalize();
    grow(r, at, nd, length * (0.62 + r() * 0.18), radius * 0.55 * (1 - t * 0.25), depth - 1, opts, out);
  }
}

// Trunk with root flare: radius swells near the ground and pushes out into
// lobes (roots) at the very base.
function trunk(r, height, radius, lean, lobes) {
  const pts = [];
  for (let k = 0; k <= 6; k++) {
    const t = k / 6;
    pts.push(new THREE.Vector3(lean.x * t * height + (r() - 0.5) * 0.05 * t, t * height, lean.z * t * height + (r() - 0.5) * 0.05 * t));
  }
  const phase = r() * Math.PI * 2;
  const geo = limb(new THREE.CatmullRomCurve3(pts), radius, radius * 0.62, 24, 30, (t, ring) => {
    const base = 1 + 0.9 * Math.exp(-t * height * 3.2);                         // flare
    const lobe = 1 + 0.45 * Math.exp(-t * height * 5) * Math.max(0, Math.sin(ring * Math.PI * 2 * lobes + phase)) ** 2;
    return base * lobe;
  });
  return { geo, top: pts[pts.length - 1] };
}

// Leaves as instanced cards (the cut-out oak leaf), clustered around branch tips.
function leafCards(tips, count, r, { size = 0.1, tint = [0.07, 0.6, 0.45], spread = 0.5 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size * 1.15);
  const mat = new THREE.MeshStandardMaterial({ map: tex('oak_leaf.png'), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const tip = tips[Math.floor(r() * tips.length)];
    v.set(tip.p.x + (r() - 0.5) * spread, tip.p.y + (r() - 0.5) * spread * 0.7, tip.p.z + (r() - 0.5) * spread);
    q.setFromEuler(new THREE.Euler(r() * Math.PI, r() * Math.PI, r() * Math.PI));
    const k = 0.7 + r() * 0.6;
    inst.setMatrixAt(i, m4.compose(v, q, s.set(k, k, k)));
    c.setHSL(tint[0] + (r() - 0.5) * 0.04, tint[1] + (r() - 0.5) * 0.2, tint[2] + (r() - 0.5) * 0.2);
    inst.setColorAt(i, c);
  }
  inst.castShadow = true;
  return inst;
}

function finish(g, geos, kind) {
  const merged = mergeGeometries(geos, false);
  const mesh = new THREE.Mesh(merged, barkMat(kind));
  mesh.castShadow = mesh.receiveShadow = true;
  g.add(mesh);
}

// ---------------------------------------------------------------- spruce
export function makeSpruce({ seed = 1, height = 10 } = {}) {
  const r = rng(seed);
  const g = new THREE.Group();
  g.name = 'spruce_tree';
  const { geo, top } = trunk(r, height, 0.32, { x: 0, z: 0 }, 5);
  const geos = [geo];
  // knots (the round scars in the bark photo): short stubs low on the trunk
  for (let i = 0; i < 6; i++) {
    const y = 0.8 + r() * 2.2, a = r() * Math.PI * 2;
    const d = new THREE.Vector3(Math.cos(a), 0.1, Math.sin(a));
    const s = new THREE.Vector3(d.x * 0.2, y, d.z * 0.2);
    geos.push(limb(new THREE.LineCurve3(s, s.clone().addScaledVector(d, 0.14)), 0.07, 0.06, 8, 1));
  }
  // whorls of drooping branches, longer at the bottom, each carrying needle sprays
  const sprayGeo = new THREE.PlaneGeometry(1, 0.5);
  sprayGeo.translate(0.5, 0, 0);
  const sprayMat = new THREE.MeshStandardMaterial({ map: tex('spruce_spray.png'), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.85 });
  const sprays = [];
  const lightsAt = [];
  for (let y = 1.4; y < height - 0.3; y += 0.3) {
    const f = 1 - (y - 1.6) / (height - 1.6);          // 1 at bottom, 0 at top
    const L = 0.5 + 3.4 * f;
    const n = 6 + Math.round(4 * f);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.5;
      const d = new THREE.Vector3(Math.cos(a), -0.25 - r() * 0.2, Math.sin(a)).normalize();
      const s = new THREE.Vector3(0, y, 0);
      const mid = s.clone().addScaledVector(d, L * 0.5).add(new THREE.Vector3(0, 0.12, 0));
      const end = s.clone().addScaledVector(d, L);
      geos.push(limb(new THREE.QuadraticBezierCurve3(s, mid, end), 0.022 * (0.5 + f), 0.006, 5, 4));
      // needle sprays along the branch, angled down and out
      for (let k = 0; k < 5 + Math.round(7 * f); k++) {
        const t = 0.15 + 0.85 * r();
        const p = new THREE.Vector3().lerpVectors(s, end, t);
        sprays.push({ p, a: -a + (r() - 0.5) * 1.6, droop: 0.2 + r() * 0.5, k: 0.75 + 0.9 * (1 - t) * (0.4 + f) });
        if (r() < 0.2) lightsAt.push(p.clone().add(new THREE.Vector3((r() - 0.5) * 0.3, -0.12, (r() - 0.5) * 0.3)));
      }
    }
  }
  finish(g, geos, 'spruce');
  const inst = new THREE.InstancedMesh(sprayGeo, sprayMat, sprays.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), c = new THREE.Color();
  sprays.forEach((s, i) => {
    q.setFromEuler(new THREE.Euler(r() * 0.6 - 0.3, s.a, -s.droop, 'YXZ'));
    sc.set(s.k * 1.3, s.k * 1.3, 1);
    inst.setMatrixAt(i, m4.compose(s.p, q, sc));
    c.setHSL(0.42, 0.25 + r() * 0.15, 0.3 + r() * 0.2);
    inst.setColorAt(i, c);
  });
  inst.castShadow = true;
  g.add(inst);
  // the multicolour holiday lights in the photo
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false }), lightsAt.length);
  const palette = [[2.4, 0.3, 0.3], [0.3, 2.2, 0.4], [0.3, 0.6, 2.6], [2.4, 1.6, 0.3], [2.0, 0.4, 2.0], [2.2, 2.2, 2.0]];
  lightsAt.forEach((p, i) => {
    bulbs.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z));
    bulbs.setColorAt(i, c.setRGB(...palette[i % palette.length]));
  });
  g.add(bulbs);
  const glow = new THREE.PointLight('#c08aff', 3, 9, 2);
  glow.position.set(0, 3, 0);
  g.add(glow);
  g.userData.radius = 0.45;
  return g;
}

// ---------------------------------------------------------------- deciduous
function deciduous(kind, { seed = 1, height = 3.2, radius = 0.17, lean = { x: 0.03, z: 0.02 }, depth = 3, leaves = 500, leafTint, opts = {} }) {
  const r = rng(seed);
  const g = new THREE.Group();
  g.name = `${kind}_tree`;
  const { geo, top } = trunk(r, height, radius, lean, 4);
  const out = { geos: [geo], tips: [] };
  const nMain = 3 + (r() < 0.5 ? 1 : 0);
  for (let i = 0; i < nMain; i++) {
    const a = (i / nMain) * Math.PI * 2 + r();
    const d = new THREE.Vector3(Math.cos(a) * 0.55, 0.85, Math.sin(a) * 0.55).normalize();
    const start = top.clone().add(new THREE.Vector3(0, -0.4 * r(), 0));
    grow(r, start, d, 2.2 + r() * 0.8, radius * 0.6, depth, { children: 3, spread: 0.55, bend: 0.35, lift: 0.2, minUp: 0.05, ...opts }, out);
  }
  g.userData.extra?.(g, r, out);
  finish(g, out.geos, kind);
  if (leaves) g.add(leafCards(out.tips, leaves, r, { tint: leafTint }));
  g.userData.radius = radius * 1.9;
  g.userData.tips = out.tips;
  return g;
}

// Cherry: smooth grey bark with horizontal ring marks; one big knot bulge on the trunk.
export function makeCherry({ seed = 3 } = {}) {
  const g = deciduous('cherry', { seed, height: 2.4, radius: 0.15, depth: 3, leaves: 650, leafTint: [0.03, 0.65, 0.42] });
  const r = rng(seed + 99);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), barkMat('cherry'));
  knot.scale.set(1, 1.5, 0.7);
  knot.position.set(0.12, 1.5, 0.05);
  knot.rotation.y = r() * Math.PI;
  g.add(knot);
  return g;
}

// Pale flaky bark: tall straight street tree, almost bare.
export function makePaleTree({ seed = 5 } = {}) {
  return deciduous('pale', { seed, height: 3.6, radius: 0.15, depth: 3, leaves: 160, leafTint: [0.11, 0.55, 0.55] });
}

// Oak: deep furrowed bark, a slight lean, some brown leaves hanging on.
export function makeOak({ seed = 7 } = {}) {
  return deciduous('oak', { seed, height: 3.0, radius: 0.19, lean: { x: 0.05, z: -0.03 }, depth: 3, leaves: 420, leafTint: [0.07, 0.45, 0.35] });
}

// Square tree pit filled with leaf litter, with a low concrete edge.
export function makeTreePit(w = 1.4, d = 1.4) {
  const g = new THREE.Group();
  g.name = 'tree_pit';
  const litter = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex('leaf_litter.png'), roughness: 1 }));
  litter.material.map.repeat?.set(w / 0.6, d / 0.6);
  litter.rotation.x = -Math.PI / 2;
  litter.position.y = 0.012;
  g.add(litter);
  const edge = new THREE.MeshStandardMaterial({ color: '#9d9a93', roughness: 0.9 });
  for (const [x, z, sx, sz] of [[0, -d / 2, w + 0.1, 0.05], [0, d / 2, w + 0.1, 0.05], [-w / 2, 0, 0.05, d], [w / 2, 0, 0.05, d]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.05, sz), edge);
    b.position.set(x, 0.025, z);
    g.add(b);
  }
  return g;
}

// Round mulch bed (the red mulch under the spruce).
export function makeMulchBed(radius = 3) {
  const t = loader.load('assets/textures/mulch.png');   // own copy so the repeat is ours
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(radius / 0.5, radius / 0.5);
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 40), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.01;
  m.name = 'mulch_bed';
  return m;
}

// ---------------------------------------------------------------- tree with a door (tree-door photos)
// A big street tree whose trunk has a tall, lumpy-topped "door" carved into the
// base: white-painted wood with vertical grain, a small old knob plate, and a
// raised bark lip all round. The door follows the trunk's curve.
export function makeDoorTree({ seed = 21 } = {}) {
  const R = 0.34, HT = 3.4;
  const g = deciduous('oak', { seed, height: HT, radius: R, lean: { x: 0, z: 0 }, depth: 3, leaves: 260, leafTint: [0.08, 0.5, 0.4] });
  g.name = 'door_tree';
  // measure the real trunk surface: cast a ray in toward the axis at (angle, height)
  const trunkMesh = g.children.find((o) => o.isMesh && o.material === barkMat('oak'));
  const rc = new THREE.Raycaster();
  const surfAt = (a, y) => {
    const dir = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a));
    rc.set(new THREE.Vector3(Math.sin(a) * 3, y, Math.cos(a) * 3), dir);
    const h = rc.intersectObject(trunkMesh, false)[0];
    return h ? 3 - h.distance : R;
  };
  const surf = (y) => surfAt(0, y);

  // door outline in (u = angle across, v = height): narrow top with a shoulder bump, wider base
  const H = 1.45, y0 = 0.04;
  const halfW = (v) => {
    const t = v / H;
    const base = 0.55 - 0.15 * t;                                  // radians, narrows going up
    const shoulder = 0.07 * Math.exp(-((t - 0.62) ** 2) / 0.006);  // the bump on the left in the photo
    const top = t > 0.88 ? Math.sqrt(Math.max(0, 1 - ((t - 0.88) / 0.12) ** 2)) : 1;
    return { l: (base + shoulder) * top, r: base * top };
  };

  // door texture: painted white wood with grain + knob plate (canvas)
  const c = document.createElement('canvas');
  c.width = 256; c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#e8ecef'; x.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 70; i++) {
    const px = Math.random() * 256;
    x.strokeStyle = `rgba(150,160,170,${0.15 + Math.random() * 0.3})`;
    x.lineWidth = 0.5 + Math.random() * 2;
    x.beginPath(); x.moveTo(px, 0);
    for (let y = 0; y <= 512; y += 32) x.lineTo(px + Math.sin(y * 0.02 + i) * 3, y);
    x.stroke();
  }
  for (let i = 0; i < 6; i++) { // knots / chips
    x.fillStyle = 'rgba(120,125,130,0.35)';
    x.beginPath(); x.ellipse(Math.random() * 256, Math.random() * 512, 3 + Math.random() * 5, 6 + Math.random() * 8, 0, 0, 7); x.fill();
  }
  const doorTex = new THREE.CanvasTexture(c);
  doorTex.colorSpace = THREE.SRGBColorSpace;

  // curved door surface on the trunk (front faces +z)
  const UN = 16, VN = 24;
  const pos = [], uvs = [], idx = [];
  for (let j = 0; j <= VN; j++) {
    const v = (j / VN) * H, y = y0 + v, { l, r } = halfW(v);
    for (let i = 0; i <= UN; i++) {
      const s = i / UN;
      const a = -l + (l + r) * s;                 // angle from the +z axis
      const rr = surfAt(a, y) + 0.015;
      pos.push(Math.sin(a) * rr, y, Math.cos(a) * rr);
      uvs.push(s, j / VN);
    }
  }
  for (let j = 0; j < VN; j++) for (let i = 0; i < UN; i++) {
    const a = j * (UN + 1) + i, b = a + UN + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  dg.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  dg.setIndex(idx);
  dg.computeVertexNormals();
  const door = new THREE.Mesh(dg, new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.8, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  door.receiveShadow = true;
  g.add(door);

  // raised bark lip around the door
  const lip = [];
  const ring = (side) => {
    for (let j = 0; j <= VN; j++) {
      const v = (j / VN) * H, y = y0 + v, w = halfW(v);
      const a = side < 0 ? -w.l : w.r;
      const rr = surfAt(a, y) + 0.02;
      lip.push(new THREE.Vector3(Math.sin(a) * rr, y, Math.cos(a) * rr));
    }
  };
  ring(-1);
  const right = []; { const save = lip.length; ring(1); right.push(...lip.splice(save)); }
  const path = new THREE.CatmullRomCurve3([...lip, ...right.reverse()]);
  const lipMesh = new THREE.Mesh(new THREE.TubeGeometry(path, 120, 0.045, 8, false), barkMat('oak'));
  lipMesh.castShadow = true;
  g.add(lipMesh);

  // little antique knob plate on the right edge
  const plateMat = new THREE.MeshStandardMaterial({ color: '#5b4632', roughness: 0.5, metalness: 0.6 });
  const ka = halfW(0.55).r - 0.12, ky = y0 + 0.55, kr = surfAt(ka, ky) + 0.025;
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.13, 0.012), plateMat);
  plate.position.set(Math.sin(ka) * kr, ky, Math.cos(ka) * kr);
  plate.rotation.y = ka;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), plateMat);
  knob.position.copy(plate.position).add(new THREE.Vector3(Math.sin(ka) * 0.025, -0.01, Math.cos(ka) * 0.025));
  g.add(plate, knob);

  // a bulging burl above the door (the big knot in the photo)
  const burl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), barkMat('oak'));
  burl.scale.set(1.2, 0.9, 0.6);
  burl.position.set(-0.08, 2.0, surf(2.0) - 0.04);
  g.add(burl);
  return g;
}

// ---- street trees for the big streets (district avenue + main street, Elm Loop's median) -----------------------------
// The same grown oak / cherry / pale trees as the old town, baked for instancing: one merged bark geometry + one
// merged leaf geometry (bigger leaf clusters, colours baked per vertex) per variant, drawn as InstancedMeshes in
// ~90 m chunks so far ones cull. A few hundred real trees cost a handful of draw calls.
const _streetParts = {};
export function streetTreeParts(kind = 'oak', seed = 7) {
  const key = kind + seed; if (_streetParts[key]) return _streetParts[key];
  const cfg = { oak: { height: 3.4, radius: 0.2, leafTint: [0.07, 0.45, 0.33] }, cherry: { height: 3.0, radius: 0.17, leafTint: [0.09, 0.5, 0.36] }, pale: { height: 3.6, radius: 0.16, leafTint: [0.08, 0.38, 0.4] } }[kind];
  const t = deciduous(kind, { seed, ...cfg, lean: { x: 0.02, z: 0.02 }, depth: 2, leaves: 0, opts: { children: 3, spread: 0.6 } });
  const bark = t.children.find((c) => c.isMesh);
  // leaves: big clustered cards round the branch tips
  const r = rng(seed * 31 + 5), tips = t.userData.tips, quads = [], col = new THREE.Color();
  const n = 230, q = new THREE.Quaternion(), m4 = new THREE.Matrix4(), v = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const tip = tips[Math.floor(r() * tips.length)]; const k = 0.42 + r() * 0.34;
    v.set(tip.p.x + (r() - 0.5) * 0.9, tip.p.y + (r() - 0.35) * 0.7, tip.p.z + (r() - 0.5) * 0.9);
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 1.6, r() * Math.PI * 2, (r() - 0.5) * 1.6));
    const pg = new THREE.PlaneGeometry(1, 1.1); pg.applyMatrix4(m4.compose(v, q, s.set(k, k, k)));
    col.setHSL(cfg.leafTint[0] + (r() - 0.5) * 0.04, cfg.leafTint[1] + (r() - 0.5) * 0.2, cfg.leafTint[2] + (r() - 0.5) * 0.16);
    pg.setAttribute('color', new THREE.Float32BufferAttribute(new Array(4).fill([col.r, col.g, col.b]).flat(), 3)); quads.push(pg);
  }
  const leafGeo = mergeGeometries(quads, false);
  const leafMat = new THREE.MeshStandardMaterial({ map: leafClumpTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9, vertexColors: true });
  return (_streetParts[key] = { barkGeo: bark.geometry, barkMat: bark.material, leafGeo, leafMat });
}
// a cluster of the photographed oak leaf, drawn many times on one card (so a big card reads as a spray of leaves)
let _clump = null;
function leafClumpTex() {
  if (_clump) return _clump;
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const img = new Image(); img.onload = () => { const r = rng(11); x.clearRect(0, 0, 256, 256); for (let i = 0; i < 46; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 96, sz = 44 + r() * 34; x.save(); x.translate(128 + Math.cos(a) * d, 128 + Math.sin(a) * d); x.rotate(r() * 6.28); x.globalAlpha = 1; x.drawImage(img, -sz / 2, -sz / 2, sz, sz); x.restore(); } t.needsUpdate = true; };
  img.src = 'assets/textures/oak_leaf.png';
  return (_clump = t);
}
// place baked street trees: pts = [[x, z, scale?, kindIndex?]], parts = [streetTreeParts(...), ...]; returns a Group
export function placeStreetTrees(pts, parts, { seed = 3, chunk = 90, baseY = 0, scale = 1.45 } = {}) {
  const g = new THREE.Group(); g.name = 'street_trees'; const r = rng(seed);
  const cells = new Map();
  pts.forEach((p, i) => { const k = (p[3] ?? i) % parts.length; const key = `${Math.floor(p[0] / chunk)}|${Math.floor(p[1] / chunk)}|${k}`; if (!cells.has(key)) cells.set(key, { k, list: [] }); cells.get(key).list.push(p); });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), s = new THREE.Vector3();
  for (const { k, list } of cells.values()) {
    const P = parts[k]; const cx = list.reduce((a, p) => a + p[0], 0) / list.length, cz = list.reduce((a, p) => a + p[1], 0) / list.length;
    const bark = new THREE.InstancedMesh(P.barkGeo, P.barkMat, list.length), leaf = new THREE.InstancedMesh(P.leafGeo, P.leafMat, list.length);
    list.forEach((p, i) => { const sc = (p[2] || 1) * (scale + r() * 0.45); m4.compose(v.set(p[0] - cx, baseY, p[1] - cz), q.setFromAxisAngle(UP, r() * 6.28), s.set(sc, sc * (0.95 + r() * 0.15), sc)); bark.setMatrixAt(i, m4); leaf.setMatrixAt(i, m4); });
    for (const o of [bark, leaf]) { o.position.set(cx, 0, cz); o.castShadow = true; o.receiveShadow = false; o.computeBoundingSphere(); g.add(o); }
  }
  return g;
}
// a lighter spruce for tree lines (same bark + needle-spray photos as makeSpruce, ~170 big sprays, no lights)
export function spruceParts(seed = 3, height = 9) {
  const key = 'spruce' + seed; if (_streetParts[key]) return _streetParts[key];
  const r = rng(seed), { geo } = trunk(r, height, 0.26, { x: 0, z: 0 }, 5), geos = [geo], quads = [], col = new THREE.Color();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  for (let y = 1.3; y < height - 0.2; y += 0.62) {
    const f = 1 - (y - 1.3) / (height - 1.3), L = 0.5 + 3.0 * f, n = 5 + Math.round(3 * f);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.6, d = new THREE.Vector3(Math.cos(a), -0.28 - r() * 0.15, Math.sin(a)).normalize();
      const st = new THREE.Vector3(0, y, 0), end = st.clone().addScaledVector(d, L);
      geos.push(limb(new THREE.LineCurve3(st, end), 0.03 * (0.5 + f), 0.008, 4, 1));
      for (let k = 0; k < 2 + Math.round(2 * f); k++) {
        const t = 0.25 + 0.75 * ((k + r() * 0.6) / (2 + Math.round(2 * f))); p.lerpVectors(st, end, t);
        const sc = (0.9 + 1.5 * f) * (1.25 - 0.5 * t);
        q.setFromEuler(new THREE.Euler(r() * 0.6 - 0.3, -a + (r() - 0.5) * 1.2, -0.25 - r() * 0.4, 'YXZ'));
        const pg = new THREE.PlaneGeometry(1, 0.5); pg.translate(0.4, 0, 0); pg.applyMatrix4(m4.compose(p, q, s.set(sc * 1.3, sc * 1.3, 1)));
        col.setHSL(0.4, 0.24 + r() * 0.14, 0.34 + r() * 0.16).multiplyScalar(1.5); pg.setAttribute('color', new THREE.Float32BufferAttribute(new Array(4).fill([col.r, col.g, col.b]).flat(), 3)); quads.push(pg);
      }
    }
  }
  // the leader: a few upright sprays at the tip
  for (let k = 0; k < 4; k++) { q.setFromEuler(new THREE.Euler(0, k * 1.57, 1.2, 'YXZ')); const pg = new THREE.PlaneGeometry(1, 0.5); pg.translate(0.4, 0, 0); pg.applyMatrix4(m4.compose(p.set(0, height - 0.5, 0), q, s.set(1.1, 1.1, 1))); col.setHSL(0.4, 0.3, 0.3); pg.setAttribute('color', new THREE.Float32BufferAttribute(new Array(4).fill([col.r, col.g, col.b]).flat(), 3)); quads.push(pg); }
  const leafMat = new THREE.MeshStandardMaterial({ map: tex('spruce_spray.png'), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.85, vertexColors: true });
  return (_streetParts[key] = { barkGeo: mergeGeometries(geos, false), barkMat: barkMat('spruce'), leafGeo: mergeGeometries(quads, false), leafMat });
}
// a conifer crown made of needle-spray cards (for tall cedars: goes on top of a bare trunk). Origin at the crown's
// base; `h` tall, `rad` wide at the bottom. Returns { geo, mat } (vertex-coloured, shared material).
let _sprayMat = null;
export function crownSprays(seed = 1, h = 5, rad = 1.5) {
  const key = `crown${seed}|${h}|${rad}`; if (_streetParts[key]) return _streetParts[key];
  const r = rng(seed), quads = [], col = new THREE.Color(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  for (let y = 0; y < h; y += 0.42) {
    const f = 1 - y / h, L = 0.35 + rad * f, n = 5 + Math.round(4 * f);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.8, sc = (0.8 + 1.0 * f) * (0.8 + r() * 0.4);
      p.set(Math.cos(a) * L * 0.25, y + r() * 0.2, Math.sin(a) * L * 0.25);
      q.setFromEuler(new THREE.Euler(r() * 0.5 - 0.25, -a, -0.3 - r() * 0.45, 'YXZ'));
      const pg = new THREE.PlaneGeometry(1, 0.5); pg.translate(0.42, 0, 0); pg.applyMatrix4(m4.compose(p, q, s.set(sc * 1.25, sc * 1.25, 1)));
      col.setHSL(0.38, 0.28 + r() * 0.12, 0.3 + r() * 0.14).multiplyScalar(1.6); pg.setAttribute('color', new THREE.Float32BufferAttribute(new Array(4).fill([col.r, col.g, col.b]).flat(), 3)); quads.push(pg);
    }
  }
  _sprayMat = _sprayMat || new THREE.MeshStandardMaterial({ map: tex('spruce_spray.png'), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.85, vertexColors: true });
  return (_streetParts[key] = { geo: mergeGeometries(quads, false), mat: _sprayMat });
}
// a leafy mass of clustered leaf cards (for small trees + shrubs): unit radius, scale the mesh. { geo, mat }
export function leafBlob(seed = 1, tint = [0.25, 0.4, 0.3]) {
  const key = `blob${seed}|${tint}`; if (_streetParts[key]) return _streetParts[key];
  const r = rng(seed), quads = [], col = new THREE.Color(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  for (let i = 0; i < 30; i++) {
    const a = r() * 6.28, u = r() * 2 - 1, d = 0.45 + r() * 0.5, sr = Math.sqrt(1 - u * u); p.set(Math.cos(a) * sr * d, u * d * 0.8, Math.sin(a) * sr * d);
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 2, r() * 6.28, (r() - 0.5) * 2)); const k = 0.7 + r() * 0.5;
    const pg = new THREE.PlaneGeometry(1, 1.1); pg.applyMatrix4(m4.compose(p, q, s.set(k, k, k)));
    col.setHSL(tint[0] + (r() - 0.5) * 0.05, tint[1] + (r() - 0.5) * 0.15, tint[2] + (r() - 0.5) * 0.14); pg.setAttribute('color', new THREE.Float32BufferAttribute(new Array(4).fill([col.r, col.g, col.b]).flat(), 3)); quads.push(pg);
  }
  return (_streetParts[key] = { geo: mergeGeometries(quads, false), mat: new THREE.MeshStandardMaterial({ map: leafClumpTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9, vertexColors: true }) });
}
// drop-in for the old flat-shaded foliage balls: a Mesh of leaf cards with the given radius
export function leafBall(radius = 1, seed = 1, tint = [0.25, 0.4, 0.3]) { tint = tint.map((v) => Math.round(v / 0.04) * 0.04);   // (a few shared tints, not one material per ball)
  const lb = leafBlob(1 + (Math.abs(Math.floor(seed)) % 4), tint); const m = new THREE.Mesh(lb.geo, lb.mat); m.scale.setScalar(radius * 1.25); m.rotation.y = seed * 2.4; m.castShadow = true; return m; }
// a low spreading conifer shrub (juniper): needle sprays fanning out from the centre in a mound ~1 m across. { geo, mat }
export function sprayMound(seed = 1) {
  const key = 'mound' + seed; if (_streetParts[key]) return _streetParts[key];
  const r = rng(seed * 13 + 2), quads = [], col = new THREE.Color(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  for (let i = 0; i < 80; i++) {
    const a = r() * 6.28, lift = 0.05 + r() * 0.6, sc = 0.4 + r() * 0.28;
    p.set(Math.cos(a) * 0.05, 0.04 + r() * 0.1, Math.sin(a) * 0.05); q.setFromEuler(new THREE.Euler(r() * 0.8 - 0.4, -a, lift, 'YXZ'));
    const pg = new THREE.PlaneGeometry(1, 0.5); pg.translate(0.45, 0, 0); pg.applyMatrix4(m4.compose(p, q, s.set(sc, sc, 1)));
    col.setHSL(0.33, 0.35 + r() * 0.12, 0.5 + r() * 0.2).multiplyScalar(2.4); pg.setAttribute('color', new THREE.Float32BufferAttribute(new Array(4).fill([col.r, col.g, col.b]).flat(), 3)); quads.push(pg);
  }
  _sprayMat = _sprayMat || new THREE.MeshStandardMaterial({ map: tex('spruce_spray.png'), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.85, vertexColors: true });
  return (_streetParts[key] = { geo: mergeGeometries(quads, false), mat: _sprayMat });
}
