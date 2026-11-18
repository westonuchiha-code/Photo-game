// Booth seating from the booth photo: lime-green vinyl bench seats with tall
// upholstered backs on a grey frame, and a thick terrazzo table between them.
// Local axes: +y up; benches run along x and face each other across z, so one
// end of the table can go against a wall. Units: metres.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

// Scale a geometry's UVs so a tiling texture keeps a real-world size.
function uvScale(geo, su, sv) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  return geo;
}

// One bench: seat cushion + back cushion, facing +z.
export function makeBench(mats, { length = 1.2 } = {}) {
  const g = new THREE.Group();
  g.name = 'booth_bench';
  const L = length;

  // Upholstered base under the seat (the photo shows vinyl down to the floor).
  const base = mesh(uvScale(new RoundedBoxGeometry(L, 0.34, 0.46, 3, 0.02), L / 0.5, 0.7), mats.boothVinyl);
  base.position.set(0, 0.17, 0.02);
  g.add(base);
  // Seat cushion: plump, rounded front edge, with a sewn welt line.
  const seat = mesh(uvScale(new RoundedBoxGeometry(L, 0.13, 0.52, 5, 0.05), L / 0.5, 1), mats.boothVinyl);
  seat.position.set(0, 0.405, 0.04);
  g.add(seat);
  const welt = mesh(new THREE.BoxGeometry(L - 0.06, 0.006, 0.006), mats.boothVinylDark);
  welt.position.set(0, 0.36, 0.3);
  g.add(welt);

  // Back cushion, leaning back slightly.
  const back = mesh(uvScale(new RoundedBoxGeometry(L, 0.66, 0.1, 5, 0.04), L / 0.5, 1.3), mats.boothVinyl);
  back.position.set(0, 0.82, -0.2);
  back.rotation.x = -0.08;
  g.add(back);

  // Grey frame: back shell + top cap (the painted panel behind the cushion).
  const shell = mesh(new THREE.BoxGeometry(L + 0.04, 1.12, 0.05), mats.boothFrame);
  shell.position.set(0, 0.56, -0.29);
  g.add(shell);
  const cap = mesh(new THREE.BoxGeometry(L + 0.04, 0.04, 0.16), mats.boothFrame);
  cap.position.set(0, 1.14, -0.25);
  g.add(cap);
  // Recessed dark toe-kick.
  const kick = mesh(new THREE.BoxGeometry(L - 0.04, 0.05, 0.4), mats.foot);
  kick.position.set(0, 0.025, 0.0);
  g.add(kick);
  return g;
}

export function makeTerrazzoTable(mats, { w = 1.2, d = 0.72, h = 0.76 } = {}) {
  const g = new THREE.Group();
  g.name = 'terrazzo_table';
  const t = 0.04;
  const top = mesh(uvScale(new THREE.BoxGeometry(w, t, d), w / 0.5, d / 0.5), mats.terrazzo);
  top.position.y = h - t / 2;
  g.add(top);
  // Black pedestal: column + cross foot.
  const col = mesh(new THREE.CylinderGeometry(0.045, 0.045, h - t - 0.03, 20), mats.post);
  col.position.y = (h - t) / 2;
  g.add(col);
  const plate = mesh(new THREE.BoxGeometry(0.3, 0.012, 0.3), mats.post);
  plate.position.y = h - t - 0.006;
  g.add(plate);
  for (const r of [0, Math.PI / 2]) {
    const foot = mesh(new THREE.BoxGeometry(0.62, 0.03, 0.06), mats.post);
    foot.position.y = 0.015;
    foot.rotation.y = r;
    g.add(foot);
  }
  return g;
}

// A complete booth: two facing benches with the table between, table end at -x.
export function makeBooth(mats, { length = 1.2 } = {}) {
  const g = new THREE.Group();
  g.name = 'lime_booth';
  const gap = 0.74;            // table depth between the cushions
  const z = gap / 2 + 0.3;     // bench origin offset from booth centre
  const a = makeBench(mats, { length });
  a.position.set(0, 0, -z);
  const b = makeBench(mats, { length });
  b.rotation.y = Math.PI;
  b.position.set(0, 0, z);
  const table = makeTerrazzoTable(mats, { w: length, d: gap });
  g.add(a, b, table);
  g.userData.size = { x: length + 0.04, z: 2 * (z + 0.32) };
  return g;
}
