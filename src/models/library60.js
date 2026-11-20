// Texture library (queue item 60, photos/textures2/): the seamless tiles + normal maps from tools/tex_60.py, and two
// pieces built with them, as in the photos.
//   libMat(name, tileW, tileH, opts)  material for a library tile; set UVs in metres on the geometry, or use worldBox
//   makeStuccoWall(L, H)    low tan-stucco screen wall: stucco body with control joints, a stacked-stone band that
//                           stands proud of the face, a cast-stone cap overhanging both sides. Runs along x, centred.
//   makeFlowerShrub(seed)   a rounded spirea-like shrub: dense small leaves, rusty-orange tips (mulch photo)
//   makeMulchPlanter(L, W)  wood-chip mulch bed, slightly mounded, inside a rounded-top concrete curb, with shrubs
import * as THREE from 'three';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, color = true) { if (_T[name]) return _T[name]; const t = _L.load(`assets/textures/${name}.png`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (color) t.colorSpace = THREE.SRGBColorSpace; return (_T[name] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.9, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function libMat(name, tileW = 1, tileH = 1, o = {}) {
  const m = std({ map: tex(name).clone(), normalMap: tex(name + '_n', false).clone(), normalScale: new THREE.Vector2(0.8, 0.8), ...o });
  m.map.needsUpdate = m.normalMap.needsUpdate = true; m.map.repeat.set(1 / tileW, 1 / tileH); m.normalMap.repeat.set(1 / tileW, 1 / tileH); return m;
}
// a box whose UVs are in metres on every face (so tiles keep their real size whatever the box)
function worldBox(w, h, d, mat, x, y, z, p, uOff = 0) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv; const sc = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sc[f][0] + uOff, uv.getY(i) * sc[f][1]); }
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
}

export function makeStuccoWall(L = 6, H = 1.15) {
  const g = new THREE.Group(); g.name = 'stucco_wall';
  const T = 0.25, BY0 = 0.62, BY1 = 0.8;
  const stucco = libMat('tx_stucco', 1.8, 1.8, { color: '#e8e0cc' }); stucco.normalScale.set(0.35, 0.35); const _s = 0, band = libMat('tx_band', 1.6, BY1 - BY0), cap = libMat('tx_rock', 1.2, 1.2, { color: '#f0e8dc' });
  worldBox(L, BY0, T, stucco, 0, BY0 / 2, 0, g);                                      // lower body
  worldBox(L, H - BY1, T, stucco, 0, BY1 + (H - BY1) / 2, 0, g);                      // upper body
  // the stone band: stands 3 cm proud of both faces, its stones' tops catch the light
  const bm = band; const bg = new THREE.BoxGeometry(L, BY1 - BY0, T + 0.06); const uv = bg.attributes.uv;
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * (f < 2 ? (T + 0.06) : L), uv.getY(i) * (f === 2 || f === 3 ? 0.05 : BY1 - BY0)); }
  const bandM = new THREE.Mesh(bg, bm); bandM.position.y = (BY0 + BY1) / 2; bandM.castShadow = bandM.receiveShadow = true; g.add(bandM);
  // cap: overhangs both sides with a small drip edge
  worldBox(L + 0.1, 0.08, T + 0.12, cap, 0, H + 0.04, 0, g); worldBox(L + 0.06, 0.03, T + 0.08, cap, 0, H - 0.015, 0, g);
  // control joints in the stucco below the band (thin dark grooves on both faces)
  const joint = std({ color: '#6a6250' });
  for (let x = -L / 2 + 1.8; x < L / 2 - 0.3; x += 1.8) for (const s of [-1, 1]) { const j = new THREE.Mesh(new THREE.BoxGeometry(0.012, BY0 - 0.04, 0.004), joint); j.position.set(x, BY0 / 2, s * (T / 2 + 0.001)); g.add(j); }
  g.userData.collider = [-L / 2 - 0.05, L / 2 + 0.05, -T / 2 - 0.06, T / 2 + 0.06];
  return g;
}

// leaf + flower sprites, drawn once
let _leaf = null, _flower = null;
function leafTex() { if (_leaf) return _leaf; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#e4e4e0'; x.beginPath(); x.ellipse(32, 32, 12, 28, 0, 0, 7); x.fill(); x.strokeStyle = '#ffffff'; x.lineWidth = 2; x.beginPath(); x.moveTo(32, 6); x.lineTo(32, 58); x.stroke(); _leaf = new THREE.CanvasTexture(c); _leaf.colorSpace = THREE.SRGBColorSpace; return _leaf; }
function flowerTex() { if (_flower) return _flower; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); for (let i = 0; i < 14; i++) { x.fillStyle = ['#d8743a', '#e89a4a', '#c85a3a', '#f0b060'][i % 4]; x.beginPath(); x.arc(32 + Math.cos(i * 2.4) * (6 + i), 32 + Math.sin(i * 2.4) * (6 + i), 5, 0, 7); x.fill(); } _flower = new THREE.CanvasTexture(c); _flower.colorSpace = THREE.SRGBColorSpace; return _flower; }
export function makeFlowerShrub(seed = 1, R = 0.42) {
  const g = new THREE.Group(); g.name = 'flower_shrub'; const r = rng(seed);
  // twiggy core
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 0.75, 1), std({ color: '#2e3a1e', roughness: 1, flatShading: true })); core.scale.set(1, 0.75, 1); core.position.y = R * 0.6; g.add(core);
  const leafG = new THREE.PlaneGeometry(0.06, 0.1), flG = new THREE.PlaneGeometry(0.11, 0.11);
  const leaves = new THREE.InstancedMesh(leafG, std({ map: leafTex(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 }), 900);
  const flowers = new THREE.InstancedMesh(flG, std({ map: flowerTex(), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.8, color: '#e8c0a0' }), 60);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), C = new THREE.Color();
  const onShell = (k) => { const u = r() * 2 - 1, a = r() * 6.283, s = Math.sqrt(1 - u * u); const rr = R * (0.8 + r() * 0.25 * k); P.set(Math.cos(a) * s * rr, Math.max(0.05, u * 0.75 * rr + R * 0.6), Math.sin(a) * s * rr); };
  for (let i = 0; i < 900; i++) { onShell(1); Q.setFromEuler(E.set(r() * 3, r() * 3, r() * 3)); M.compose(P, Q, new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + r() * 0.5)); leaves.setMatrixAt(i, M); leaves.setColorAt(i, C.setHSL(0.17 + r() * 0.07, 0.45, 0.3 + r() * 0.17)); }
  for (let i = 0; i < 60; i++) { onShell(1.4); if (P.y < R * 0.55) P.y = R * 0.55 + r() * R * 0.5; Q.setFromEuler(E.set(-1.2 + r() * 0.6, r() * 6, 0)); M.compose(P, Q, new THREE.Vector3(1, 1, 1).multiplyScalar(0.7 + r() * 0.6)); flowers.setMatrixAt(i, M); }
  leaves.castShadow = true; g.add(leaves, flowers);
  return g;
}
export function makeMulchPlanter(L = 5, W = 2.2, nShrubs = 3, seed = 3) {
  const g = new THREE.Group(); g.name = 'mulch_planter'; const r = rng(seed);
  // mulch bed: a subdivided plane mounded toward the middle, a little lumpy
  const bed = new THREE.PlaneGeometry(L - 0.3, W - 0.3, 30, 14); bed.rotateX(-Math.PI / 2); const p = bed.attributes.position, uv = bed.attributes.uv;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const e = Math.min(1, Math.min((L - 0.3) / 2 - Math.abs(x), (W - 0.3) / 2 - Math.abs(z)) / 0.5); p.setY(i, 0.08 + 0.07 * e + 0.015 * Math.sin(x * 9 + z * 7)); uv.setXY(i, x / 0.9, z / 0.9); }
  bed.computeVertexNormals();
  const bm = new THREE.Mesh(bed, libMat('tx_mulch', 1, 1)); bm.material.map.repeat.set(1, 1); bm.material.normalMap.repeat.set(1, 1); bm.receiveShadow = true; g.add(bm);
  // curb: rounded-top concrete profile swept round the rectangle (four straight runs)
  const prof = new THREE.Shape(); prof.moveTo(-0.075, 0); prof.lineTo(0.075, 0); prof.lineTo(0.075, 0.2); prof.quadraticCurveTo(0.075, 0.25, 0.03, 0.25); prof.lineTo(-0.03, 0.25); prof.quadraticCurveTo(-0.075, 0.25, -0.075, 0.2); prof.closePath();
  const conc = std({ map: tex('lot_concrete'), color: '#eeebe4', roughness: 0.85 });
  for (const [len, x, z, ry] of [[L, 0, -W / 2 + 0.075, 0], [L, 0, W / 2 - 0.075, 0], [W - 0.3, -L / 2 + 0.075, 0, Math.PI / 2], [W - 0.3, L / 2 - 0.075, 0, Math.PI / 2]]) {
    const geo = new THREE.ExtrudeGeometry(prof, { depth: len, bevelEnabled: false }); geo.translate(0, 0, -len / 2); geo.rotateY(Math.PI / 2);
    const m = new THREE.Mesh(geo, conc); m.position.set(x, 0, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; g.add(m);
  }
  for (let i = 0; i < nShrubs; i++) { const s = makeFlowerShrub(seed * 10 + i, 0.32 + r() * 0.14); s.position.set(-L / 2 + 0.7 + i * (L - 1.4) / Math.max(1, nShrubs - 1), 0.12, (r() - 0.5) * (W - 1.2)); s.rotation.y = r() * 6; g.add(s); }
  // a few wood chips spilled over the curb + dry leaves
  const chip = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.006, 0.012), std({ color: '#7a4a2a' }), 40); const M = new THREE.Matrix4(), Q = new THREE.Quaternion();
  for (let i = 0; i < 40; i++) { Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6); M.compose(new THREE.Vector3((r() - 0.5) * L, 0.004, (r() < 0.5 ? -1 : 1) * (W / 2 + 0.03 + r() * 0.1)), Q, new THREE.Vector3(1, 1, 1)); chip.setMatrixAt(i, M); }
  g.add(chip);
  g.userData.collider = [-L / 2, L / 2, -W / 2, W / 2];
  return g;
}
