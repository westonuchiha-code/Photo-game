// Small geometry helpers shared by the world builders.
import * as THREE from 'three';

// Scale a BoxGeometry's UVs so a texture repeats every `unit` metres on every face.
export function boxUVs(geo, w, h, d, unit = 1, unitV = unit) {
  const uv = geo.attributes.uv;
  // face order +x, -x, +y, -y, +z, -z ; [u-size, v-size]
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * (dims[f][0] / unit), uv.getY(k) * (dims[f][1] / unitV));
    }
  }
  return geo;
}

export function box(w, h, d, mat, x = 0, y = 0, z = 0, { unit = null, shadow = true } = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  if (unit) boxUVs(geo, w, h, d, ...(Array.isArray(unit) ? unit : [unit]));
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (shadow) m.castShadow = m.receiveShadow = true;
  return m;
}

export function cyl(r, h, mat, x = 0, y = 0, z = 0, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

// A flat floor/ground patch with its texture repeating every `unit` metres.
export function plane(mat, x0, x1, z0, z1, y = 0, unit = 1, unitV = unit) {
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / unit, uv.getY(i) * (z1 - z0) / unitV);
  const m = new THREE.Mesh(geo, mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  m.receiveShadow = true;
  return m;
}

// Text drawn to a canvas, for menu boards, screens and signs.
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
