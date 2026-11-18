// Yellow tubular bar stool with wooden slats, modelled from the reference photo.
// Local axes: +y up, +z = front of the seat (where your knees go). Units: metres.
import * as THREE from 'three';

const R = 0.0125; // tube radius (~25 mm steel tube)

// Polyline with rounded corners -> a smooth tube path.
export function roundedPath(points, radius = 0.05) {
  const pts = points.map((p) => new THREE.Vector3(...p));
  const path = new THREE.CurvePath();
  let start = pts[0].clone();
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1], cur = pts[i], next = pts[i + 1];
    const a = prev.clone().sub(cur), b = next.clone().sub(cur);
    const r = Math.min(radius, a.length() * 0.45, b.length() * 0.45);
    const p1 = cur.clone().add(a.normalize().multiplyScalar(r));
    const p2 = cur.clone().add(b.normalize().multiplyScalar(r));
    path.add(new THREE.LineCurve3(start, p1));
    path.add(new THREE.QuadraticBezierCurve3(p1, cur.clone(), p2));
    start = p2;
  }
  path.add(new THREE.LineCurve3(start, pts[pts.length - 1]));
  return path;
}

function tube(points, mat, { radius = 0.05, segments = 96 } = {}) {
  const geo = new THREE.TubeGeometry(roundedPath(points, radius), segments, R, 10, false);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function lerp3(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

// A box bent along an arc in its local x direction (for curved slats).
function bentSlat(w, h, d, bend, mat, uvRow = 0) {
  const geo = new THREE.BoxGeometry(w, h, d, 24, 1, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const t = (2 * x) / w;
    pos.setZ(i, pos.getZ(i) - bend * (1 - t * t));
  }
  // use one of the two slat variants in the texture (top or bottom half)
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, uvRow * 0.5 + uv.getY(i) * 0.5);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

// Generic tubular slat chair; the bar stool and the pink dining chair are
// the same design family at different heights.
export function makeSlatChair(mats, {
  name = 'slat_chair', paint = mats.paint, seed = 0,
  seatY = 0.74, backTop = 1.03, backSlats = [0.855, 0.95], backSlatH = 0.07,
  seatSlats = 7, footrest = true,
} = {}) {
  const g = new THREE.Group();
  g.name = name;
  const zb = -0.21;    // back legs
  const zf = 0.23;     // front leg feet
  const k = seatY / 0.74; // proportions scale with height

  for (const s of [-1, 1]) {
    // Front leg rises, then turns back under the seat as the side rail
    // and meets the back leg (as on the photographed stools).
    g.add(tube([
      [s * 0.225, 0, zf],
      [s * 0.2, seatY, zf - 0.04 * k],
      [s * 0.2, seatY, zb + 0.005],
    ], paint, { radius: 0.06 }));
  }

  // Back legs + backrest: one continuous inverted U.
  const bl0 = [-0.215, 0, zb - 0.03], bl1 = [-0.195, backTop, zb + 0.01];
  g.add(tube([bl0, bl1, [0.195, backTop, zb + 0.01], [0.215, 0, zb - 0.03]], paint, { radius: 0.07, segments: 160 }));

  if (footrest) {
    // Foot-rest ring (front + sides) at shin height.
    const fy = 0.30, t = fy / seatY;
    const frontL = lerp3([-0.225, 0, zf], [-0.2, seatY, zf - 0.04 * k], t);
    const frontR = [-frontL[0], fy, frontL[2]];
    const backL = lerp3(bl0, bl1, fy / backTop);
    const backR = [-backL[0], fy, backL[2]];
    frontL[1] = fy; backL[1] = fy;
    g.add(tube([frontL, frontR], paint));
    g.add(tube([frontL, backL], paint));
    g.add(tube([frontR, backR], paint));
  }

  // Seat: narrow slats, slightly dished front-to-back.
  const n = seatSlats, depth = 0.4, z0 = zb + 0.02;
  for (let i = 0; i < n; i++) {
    const z = z0 + (i + 0.5) * (depth / n);
    const u = (z - (z0 + depth / 2)) / (depth / 2);
    const slat = bentSlat(0.43, 0.016, depth / n - 0.009, 0, mats.slat, (i + seed) % 2);
    slat.position.set(0, seatY + R + 0.008 + 0.012 * u * u, z);
    slat.rotation.x = -0.08 * u;
    g.add(slat);
  }

  // Backrest: curved slats on brackets with bolts.
  const plateGeo = new THREE.BoxGeometry(0.035, backSlatH, 0.006);
  const boltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.008, 8);
  boltGeo.rotateX(Math.PI / 2);
  const backLegZ = (yy) => zb - 0.03 + (0.04 * yy) / backTop;
  backSlats.forEach((y, j) => {
    const zc = backLegZ(y) + R + 0.012;
    const slat = bentSlat(0.43, backSlatH, 0.016, 0.018, mats.slat, (j + seed) % 2);
    slat.position.set(0, y, zc);
    g.add(slat);
    for (const s of [-1, 1]) {
      const xLeg = s * (0.215 - (0.02 * y) / backTop);
      const plate = new THREE.Mesh(plateGeo, paint);
      plate.position.set(xLeg, y, zc + 0.012);
      plate.castShadow = true;
      g.add(plate);
      for (const dy of [-backSlatH / 4, backSlatH / 4]) {
        const b = new THREE.Mesh(boltGeo, mats.bolt);
        b.position.set(xLeg, y + dy, zc + 0.017);
        g.add(b);
      }
    }
  });

  // Rubber feet.
  const footGeo = new THREE.CylinderGeometry(R * 1.05, R * 1.1, 0.02, 10);
  for (const p of [[-0.225, zf], [0.225, zf], [-0.215, zb - 0.03], [0.215, zb - 0.03]]) {
    const f = new THREE.Mesh(footGeo, mats.foot);
    f.position.set(p[0], 0.01, p[1]);
    g.add(f);
  }

  g.userData.radius = 0.28; // for collision
  return g;
}

// Yellow bar stool (photo 1).
export function makeStool(mats, { seed = 0 } = {}) {
  return makeSlatChair(mats, { name: 'yellow_bar_stool', seed });
}

// Pink dining chair (entrance photo): same family, dining height, 4 back slats.
export function makePinkChair(mats, { seed = 0 } = {}) {
  return makeSlatChair(mats, {
    name: 'pink_slat_chair', paint: mats.pinkPaint, seed,
    seatY: 0.45, backTop: 0.86, backSlats: [0.6, 0.67, 0.74, 0.81], backSlatH: 0.055,
    seatSlats: 9, footrest: false,
  });
}
