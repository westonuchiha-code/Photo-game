// Long window bar: butcher-block top on a pale grey steel frame with a glass
// panel underneath and a black support post, modelled from the reference photo.
// Local axes: +y up, +z = customer side (where the stools go). Units: metres.
import * as THREE from 'three';

const TEX_M = 1.44; // butcher_block.png covers 1.44 m x 0.36 m (64 px = 45 mm strip)
const TEX_V = 0.36;

// Scale a BoxGeometry's UVs so textures keep a real-world size per face.
function realUVs(geo, w, h, d, sizes) {
  const uv = geo.attributes.uv;
  // face order: +x, -x, +y, -y, +z, -z ; each face: [u-dim, v-dim]
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    const [su, sv] = sizes[f];
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * (dims[f][0] / su), uv.getY(k) * (dims[f][1] / sv));
    }
  }
}

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function makeCounter(mats, { length = 4.4, height = 1.07, depth = 0.5 } = {}) {
  const g = new THREE.Group();
  g.name = 'butcher_block_bar_counter';
  const L = length;

  // Countertop: top face uses the stacked-strip texture, edges use the
  // straightened photo of the real countertop edge.
  const tt = 0.045;
  const topGeo = new THREE.BoxGeometry(L, tt, depth);
  const edgeSize = [TEX_M, tt];
  realUVs(topGeo, L, tt, depth, [edgeSize, edgeSize, [TEX_M, TEX_V], [TEX_M, TEX_V], edgeSize, edgeSize]);
  const top = new THREE.Mesh(topGeo, [
    mats.counterEdge, mats.counterEdge, mats.counterTop, mats.counterTop, mats.counterEdge, mats.counterEdge,
  ]);
  top.position.set(0, height - tt / 2, 0);
  top.castShadow = top.receiveShadow = true;
  g.add(top);

  // Steel frame, recessed a little behind the front of the top.
  const fz = -0.02;          // frame centre line
  const fd = 0.07;           // frame depth
  const yTopRail = height - tt - 0.035;
  g.add(box(L - 0.04, 0.07, fd, mats.frame, 0, yTopRail, fz));
  // Kick plate along the floor (the pale ledge in the photo).
  g.add(box(L - 0.04, 0.16, 0.2, mats.kick, 0, 0.08, fz));
  g.add(box(L - 0.04, 0.03, fd, mats.frame, 0, 0.175, fz));
  // End uprights.
  for (const s of [-1, 1]) g.add(box(0.06, height - tt, fd, mats.frame, s * (L / 2 - 0.05), (height - tt) / 2, fz));
  // A slim mullion every ~1.5 m.
  const bays = Math.max(1, Math.round(L / 1.5));
  for (let i = 1; i < bays; i++) {
    const x = -L / 2 + (L * i) / bays;
    g.add(box(0.035, height - tt - 0.2, 0.04, mats.frame, x, 0.19 + (height - tt - 0.2) / 2, fz));
  }

  // Glass panel.
  const gh = yTopRail - 0.035 - 0.19;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.12, gh), mats.glass);
  glass.position.set(0, 0.19 + gh / 2, fz);
  glass.renderOrder = 2;
  g.add(glass);

  // Black round support post near one end, in front of the glass.
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, height - tt, 20), mats.post);
  post.position.set(L / 2 - 0.55, (height - tt) / 2, fz + 0.09);
  post.castShadow = true;
  g.add(post);

  g.userData.bounds = { halfX: L / 2, halfZ: depth / 2 };
  g.userData.height = height;
  return g;
}
