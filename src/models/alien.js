// Alien rock formation from the five cracked-impasto "alien" photos.
// Twisted spires and lumpy boulders, each wrapped in one of the textures, with
// the deepest crevices glowing faintly teal (glow maps from make_textures.py)
// and a slow pulse. One hovering shard at the centre.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const loader = new THREE.TextureLoader();
function tex(name, color = true) {
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const mats = [];
function alienMat(i) {
  if (mats[i]) return mats[i];
  mats[i] = new THREE.MeshStandardMaterial({
    map: tex(`alien_${i}.png`), normalMap: tex(`alien_${i}_normal.png`, false), normalScale: new THREE.Vector2(1.6, 1.6),
    emissiveMap: tex(`alien_${i}_glow.png`), emissive: new THREE.Color(0.9, 0.9, 0.9),
    roughness: 0.8, metalness: 0.05,
  });
  return mats[i];
}

// A spire: a cylinder that tapers, twists, bends and gets lumpy; or a boulder
// (squashed lumpy sphere). UVs repeat so the photo texture keeps its scale.
function spireGeo(r, height, radius, twist, lean) {
  let g = new THREE.CylinderGeometry(radius * 0.18, radius, height, 18, 24, false);
  g.deleteAttribute('normal');
  const uvKeep = g.attributes.uv.clone();
  g.translate(0, height / 2, 0);
  const p = g.attributes.position;
  const bumps = Array.from({ length: 5 }, () => [r() * Math.PI * 2, r() * height, 0.25 + r() * 0.5, (r() - 0.3) * radius * 0.5]);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = y / height;
    const a = Math.atan2(z, x) + twist * t;
    let rr = Math.hypot(x, z);
    for (const [ba, by, bw, bh] of bumps) {
      const d = Math.hypot(Math.sin((a - ba) / 2) * 2, (y - by) / (height * bw));
      rr += bh * Math.exp(-d * d * 3);
    }
    rr *= 1 + 0.08 * Math.sin(a * 5 + y * 3);
    const bend = lean * t * t * height;
    p.setXYZ(i, Math.cos(a) * rr + bend, y, Math.sin(a) * rr);
  }
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uvKeep.getX(i) * Math.max(1, Math.round(radius * 4)), uvKeep.getY(i) * height / 1.0);
  g.computeVertexNormals();
  return g;
}

function boulderGeo(r, size) {
  let g = new THREE.IcosahedronGeometry(1, 3);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  const bumps = Array.from({ length: 6 }, () => [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, (r() - 0.4) * 0.5]);
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let k = 1;
    for (const [bx, by, bz, a] of bumps) k += a * Math.max(0, v.x * bx + v.y * by + v.z * bz) ** 2;
    uv[i * 2] = (0.5 + Math.atan2(v.z, v.x) / (2 * Math.PI)) * 3;
    uv[i * 2 + 1] = (0.5 + Math.asin(v.y) / Math.PI) * 1.5;
    p.setXYZ(i, v.x * k * size, v.y * k * size * 0.62, v.z * k * size);
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

export function makeAlienFormation({ seed = 42 } = {}) {
  const r = rng(seed);
  const g = new THREE.Group();
  g.name = 'alien_formation';
  const colliders = [];
  // ring of spires leaning inward around a centre clearing
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    const dist = 1.4 + r() * 0.7;
    const h = 2.2 + r() * 2.6;
    const rad = 0.35 + r() * 0.3;
    const m = new THREE.Mesh(spireGeo(r, h, rad, (r() - 0.5) * 2.5, -0.12 - r() * 0.1), alienMat(1 + (i % 5)));
    m.position.set(Math.cos(a) * dist, -0.05, Math.sin(a) * dist);
    m.rotation.y = -a;               // lean (bend along +x) points toward the centre
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    colliders.push([m.position.x, m.position.z, rad * 0.9]);
  }
  // boulders scattered around the base
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2, d = 0.6 + r() * 2.6, s = 0.18 + r() * 0.35;
    const b = new THREE.Mesh(boulderGeo(r, s), alienMat(1 + Math.floor(r() * 5)));
    b.position.set(Math.cos(a) * d, s * 0.25, Math.sin(a) * d);
    b.rotation.y = r() * 6;
    b.castShadow = b.receiveShadow = true;
    g.add(b);
    if (s > 0.3) colliders.push([b.position.x, b.position.z, s * 0.9]);
  }
  // hovering shard in the middle, slowly turning
  const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), alienMat(5));
  shard.scale.set(0.7, 1.6, 0.7);
  shard.position.y = 1.5;
  g.add(shard);
  const light = new THREE.PointLight('#5fffe0', 2.5, 7, 2);
  light.position.y = 1.4;
  g.add(light);

  g.userData.colliders = colliders;
  g.userData.update = (t) => {
    const pulse = 0.55 + 0.45 * Math.sin(t * 1.3);
    for (const m of mats) if (m) m.emissive.setScalar(0.35 + 0.65 * pulse);
    shard.rotation.y = t * 0.6;
    shard.position.y = 1.5 + Math.sin(t * 0.9) * 0.12;
    light.intensity = 1.2 + 1.8 * pulse;
  };
  return g;
}
