// Surface finishes (polish pass). Many big surfaces in the hand-built places were plain colours: painted walls,
// ceilings, concrete decks, flat roofs. applyFinishes(root) gives every large flat-coloured surface a real material
// from the photo library while KEEPING its designed colour: the texture is tinted by (designed colour / the
// texture's average colour), so a cream wall stays cream but gains the plaster's mottling, a grey deck gains
// concrete grain, and so on. UVs are box-projected at real-world scale (no stretching on any box or plane).
//   - light or coloured paint  -> smooth plaster (sg_plaster)      - mid neutral greys -> cast concrete (lot_concrete)
//   - per-place overrides below: flat roofs -> ballast gravel, shop ceilings -> speckled acoustic tile, ...
// Skipped: metals, glass, glowing / vertex-coloured / already-textured materials, small parts (< 6 m2), vehicles,
// and any material with userData.flat = true.
import * as THREE from 'three';
import { NORMAL_OF } from './normals.js';

// average linear colour of each finish texture (tools: mean of the PNG in linear space) + tile size in metres
const FIN = {
  plaster: { tex: 'sg_plaster', avg: [0.547, 0.547, 0.510], tile: 2.4, soft: 0.4 },
  concrete: { tex: 'lot_concrete', avg: [0.303, 0.295, 0.269], tile: 3 },
  gravel: { tex: 'b83_gravel', avg: [0.461, 0.378, 0.293], tile: 3 },
  ceiling: { tex: 'b82_speckle', avg: [0.439, 0.390, 0.367], tile: 1.2 },
  stucco: { tex: 'tx_stucco', avg: [0.543, 0.463, 0.315], tile: 2.5, soft: 0.6 },
  plank: { tex: 'wd_plank_a', avg: [0.202, 0.087, 0.032], tile: 1.6 },
};
// place-specific picks: '<set name>#<hex colour>' -> finish
const OVERRIDE = {
  'hearth_market#3a3a3c': 'gravel', 'dentist_office#2c2d30': 'gravel', 'corner_store#2a2c30': 'gravel', 'bar_alley#3a3a3c': 'gravel',
  'mall_passage#5a5a5c': 'gravel', 'old_town_row#3a3a3c': 'gravel', 'takeout_calzone_kid#2a2a2c': 'gravel', 'art_gallery#3a3a3c': 'gravel',
  'hearth_market#d8d8d4': 'ceiling', 'warehouse_store#d8dade': null, 'old_town_row#d8d4cc': 'stucco', 'old_town_row#d8d0c0': 'stucco',
  'knot_room#4a3a2c': 'plank', 'old_izakaya#2a2622': 'plank',
};
const SKIP_SET = /^car_|bus|train|truck|scooter|night_sky|city_district|elm_loop|street_trees|creep|alien|cat_|moss_|clean_bot|patrol|van$/;
const _L = new THREE.TextureLoader(), _tex = {};
// a quieter copy of a texture: its contrast pulled toward its own average (paint over plaster, not raw plaster)
function softTex(name, avg, keep = 0.45) {
  const k = name + '|soft'; if (_tex[k]) return _tex[k];
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); const toS = (v) => Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
  const fill = `rgb(${toS(avg[0])},${toS(avg[1])},${toS(avg[2])})`; x.fillStyle = fill; x.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; t.name = name + '_soft';
  const img = new Image(); img.onload = () => { x.globalAlpha = 1; x.drawImage(img, 0, 0, 512, 512); x.globalAlpha = 1 - keep; x.fillStyle = fill; x.fillRect(0, 0, 512, 512); x.globalAlpha = 1; t.needsUpdate = true; }; img.src = `assets/textures/${name}.png`;
  return (_tex[k] = t);
}
function tex(name, color) { const k = name; if (!_tex[k]) { const t = _L.load(`assets/textures/${name}.png`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (color) t.colorSpace = THREE.SRGBColorSpace; _tex[k] = t; } return _tex[k]; }
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _s = new THREE.Vector3(), _q = new THREE.Quaternion(), _p = new THREE.Vector3();

function worldArea(o) {
  const pos = o.geometry.attributes.position, idx = o.geometry.index, n = idx ? idx.count : pos.count; let area = 0;
  for (let i = 0; i + 2 < n; i += 3) { const i0 = idx ? idx.getX(i) : i, i1 = idx ? idx.getX(i + 1) : i + 1, i2 = idx ? idx.getX(i + 2) : i + 2;
    _a.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld); _b.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld); _c.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld); area += _b.sub(_a).cross(_c.sub(_a)).length() / 2; }
  return area;
}
// box projection at world scale: each vertex takes the plane its normal faces most
function boxUVs(o, tile) {
  const g = o.geometry.clone(); if (!g.attributes.normal) g.computeVertexNormals();
  o.matrixWorld.decompose(_p, _q, _s);
  const pos = g.attributes.position, nrm = g.attributes.normal, uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) * _s.x, y = pos.getY(i) * _s.y, z = pos.getZ(i) * _s.z, ax = Math.abs(nrm.getX(i)), ay = Math.abs(nrm.getY(i)), az = Math.abs(nrm.getZ(i));
    let u, v; if (ax >= ay && ax >= az) { u = z; v = y; } else if (ay >= az) { u = x; v = z; } else { u = x; v = y; }
    uv[i * 2] = u / tile; uv[i * 2 + 1] = v / tile;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); o.geometry = g;
}
export function applyFinishes(root) {
  root.updateMatrixWorld(true);
  const made = new Map(), hsl = {}; let n = 0, m2 = 0;
  const visit = (o, set) => {
    if (o.name && set === null) { if (SKIP_SET.test(o.name)) return; set = o.name; }
    if (o.userData && (o.userData.update || o.userData.brain || o.userData.noFinish)) return;
    if (o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && o.geometry && o.geometry.attributes.position && !Array.isArray(o.material)) {
      const m = o.material, type = o.geometry.type;
      const ok = m && m.isMeshStandardMaterial && !m.map && !m.normalMap && !m.vertexColors && !m.transparent && !m.flatShading && !m.wireframe && m.side !== THREE.BackSide && m.metalness < 0.3
        && !(m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b) > 0.02) && !m.userData.flat && (type === 'BoxGeometry' || type === 'PlaneGeometry' || type === 'ExtrudeGeometry' || type === 'ShapeGeometry');
      if (ok) {
        const hex = m.color.getHexString(), key = `${set || ''}#${hex}`; let fin = OVERRIDE[key];
        if (fin === undefined) { m.color.getHSL(hsl); fin = hsl.s < 0.1 && hsl.l > 0.28 && hsl.l < 0.62 ? 'concrete' : hsl.l >= 0.18 ? 'plaster' : null; }
        if (fin && worldArea(o) >= 6) {
          const F = FIN[fin], mk = m.uuid + fin; let nm = made.get(mk);
          if (!nm) { nm = m.clone(); nm.map = F.soft ? softTex(F.tex, F.avg, F.soft) : tex(F.tex, true); if (NORMAL_OF[F.tex]) { nm.normalMap = tex(NORMAL_OF[F.tex], false); nm.normalScale.set(0.45, 0.45); }
            // keep the designed colour: tint = colour / the texture's average (both linear)
            nm.color.setRGB(Math.min(2.2, m.color.r / F.avg[0]), Math.min(2.2, m.color.g / F.avg[1]), Math.min(2.2, m.color.b / F.avg[2])); nm.userData.finish = fin; made.set(mk, nm); }
          m2 += worldArea(o); boxUVs(o, F.tile); o.material = nm; n++;
        }
      }
    }
    for (const c of o.children) visit(c, set);
  };
  for (const top of root.children) for (const c of (top.name === 'restaurant' ? top.children : [top])) visit(c, null);
  return { meshes: n, materials: made.size, area: Math.round(m2) };
}
