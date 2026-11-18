// Storefront pieces from the entrance photo: bronze-framed glass double doors,
// window bays, and the speckled entrance mat.
// Local axes: +y up, the front faces +z (into the room). Units: metres.
import * as THREE from 'three';

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

// Aluminium storefront window: frame + glass, optional transom bar.
export function makeWindowBay(mats, { w = 2, h = 2.6, sill = 0, transom = null } = {}) {
  const g = new THREE.Group();
  g.name = 'window_bay';
  const t = 0.06, d = 0.1;
  g.add(box(w, t, d, mats.doorFrame, 0, sill + t / 2, 0));
  g.add(box(w, t, d, mats.doorFrame, 0, sill + h - t / 2, 0));
  g.add(box(t, h, d, mats.doorFrame, -w / 2 + t / 2, sill + h / 2, 0));
  g.add(box(t, h, d, mats.doorFrame, w / 2 - t / 2, sill + h / 2, 0));
  if (transom) g.add(box(w, t, d, mats.doorFrame, 0, sill + transom, 0));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 2 * t, h - 2 * t), mats.window);
  glass.position.set(0, sill + h / 2, 0);
  glass.renderOrder = 2;
  g.add(glass);
  return g;
}

export function makeDoubleDoor(mats, { w = 1.9, h = 2.2 } = {}) {
  const g = new THREE.Group();
  g.name = 'glass_double_door';
  const t = 0.12; // wide stiles like the photo's bronze frames
  const leafW = w / 2;
  for (const s of [-1, 1]) {
    const leaf = new THREE.Group();
    const cx = s * leafW / 2;
    leaf.add(box(leafW, 0.2, 0.05, mats.doorFrame, cx, 0.1, 0));           // kick rail
    leaf.add(box(leafW, t, 0.05, mats.doorFrame, cx, h - t / 2, 0));        // top rail
    leaf.add(box(t, h, 0.05, mats.doorFrame, cx - leafW / 2 + t / 2, h / 2, 0));
    leaf.add(box(t, h, 0.05, mats.doorFrame, cx + leafW / 2 - t / 2, h / 2, 0));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(leafW - 2 * t, h - 0.2 - t), mats.window);
    glass.position.set(cx, 0.2 + (h - 0.2 - t) / 2, 0);
    glass.renderOrder = 2;
    leaf.add(glass);
    // Push bar across the glass.
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, leafW - 2 * t, 12), mats.bolt);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(cx, 1.05, 0.06);
    leaf.add(bar);
    for (const e of [-1, 1]) leaf.add(box(0.03, 0.03, 0.06, mats.bolt, cx + e * (leafW / 2 - t - 0.04), 1.05, 0.03));
    g.add(leaf);
  }
  // Outer frame + threshold.
  g.add(box(w + 0.16, 0.1, 0.12, mats.doorFrame, 0, h + 0.05, 0));
  g.add(box(0.08, h + 0.1, 0.12, mats.doorFrame, -w / 2 - 0.04, (h + 0.1) / 2, 0));
  g.add(box(0.08, h + 0.1, 0.12, mats.doorFrame, w / 2 + 0.04, (h + 0.1) / 2, 0));
  g.add(box(w, 0.012, 0.18, mats.bolt, 0, 0.006, 0.02));
  return g;
}

export function makeDoorMat(mats, { w = 1.8, d = 0.9 } = {}) {
  const geo = new THREE.BoxGeometry(w, 0.012, d);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.5, uv.getY(i) * d / 0.5);
  const m = new THREE.Mesh(geo, [mats.matEdge, mats.matEdge, mats.doorMat, mats.matEdge, mats.matEdge, mats.matEdge]);
  m.position.y = 0.006;
  m.receiveShadow = true;
  m.name = 'entrance_mat';
  return m;
}
