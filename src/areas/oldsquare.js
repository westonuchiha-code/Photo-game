// Old Town Square (phone area). The northern part of the big town's old town, lifted across as it stands: the city
// plaza, the old-town shopping street, the shops on the strip, the station gateway and lotus pond, the underground
// mall and its forecourt, the Go-club stair, the covered market alley, the bar alley with the teahouse, the noodle
// shop, the abandoned office and the Knot Room. The placement code between the two marker lines is main.js lines
// 975-1190, unchanged (the big town is the reference); this file only supplies what that code leans on.
//   buildOldSquare({ add, rect, circle, colliders }) -> { areas, ground(x, z, prevY) }
import * as THREE from 'three';
import { plane } from '../world/util.js';
import { makeThriftCorner } from '../models/fabrics56.js';
import { makeStationGate, makeLotusPond, makeRockDoor } from '../models/city28e.js';
import { makeCargoTrike, makeArcadeCabinet, makeGraffitiFront } from '../models/street28d.js';
import { makeShutterShop, makeVendingMachine, makeJunkShop } from '../models/shops28c.js';
import { makeShopHouse, makeStreetLamp as makeOldTownLamp, makeBollard, makeMonkey, makeBanner, makeGreenPillar } from '../models/oldtown.js';
import { makeBrickGable, makeSpiral, makeOvalBuilding, makePebbleBench, makeOrnateLamp, makePlanter, makePaverTexture, makeGreyBandTexture } from '../models/cityplaza.js';
import { makeUndergroundMall } from '../models/mall28f.js';
import { makeStairEntrance } from '../models/stairs28g.js';
import { makeMarketAlley } from '../models/alley28h.js';
import { makeBarAlley } from '../models/baralley28i.js';
import { makeAbandonedOffice } from '../models/abandoned29.js';
import { makeKetchupBottle } from '../models/ketchup32.js';
import { makeTunaCan } from '../models/tuna34.js';
import { makeKnotRoom } from '../models/knotroom30.js';
import { makeCornDog, makePorkBun, makeMelonBread, makeKatsuCurry, makeCheeseSticks, makeYogurtDrink, makeEnergyCan, makeUmeSour, makeCocoCan, makeCandyPack, makePizzaDisplay, makeNoodleShop } from '../models/food16.js';

export function buildOldSquare({ add, rect, circle, colliders }) {
// ======== main.js 975-1190 ========
// ------------------------------------------------------------------ city plaza (city photos, 28a)
// West of the restaurant: a paved square reached by a sidewalk strip along the restaurant's south wall.
{
  const PX0 = -44, PX1 = -9, PZ0 = -14, PZ1 = 11.8;
  const pt = makePaverTexture(); pt.repeat.set(1, 1);
  const pavMat = new THREE.MeshStandardMaterial({ map: pt, roughness: 0.85 });
  const placeRot = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = Math.cos(rot), s = Math.sin(rot);
    const col = (r) => { const [x0, x1, z0, z1] = r; const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + x * c + z * s, gz - x * s + z * c]);
      rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))); };
    if (o.userData.collider) col(o.userData.collider);
    return o;
  };
  add(plane(pavMat, PX0, PX1, PZ0, PZ1, 0.006, 2.4));
  add(plane(pavMat, PX1, 9.0, 5.3, 11.8, 0.006, 2.4));                    // connecting strip
  // grey paver bands crossing the square (photo)
  const bandMat = new THREE.MeshStandardMaterial({ map: makeGreyBandTexture(), roughness: 0.85 });
  add(plane(bandMat, PX0, PX1, 2.2, 3.4, 0.008, 1.2, 2.4));
  add(plane(bandMat, -27.6, -26.4, PZ0, PZ1, 0.009, 1.2, 2.4));
  // brick warehouse gable on the west side, facing the square
  placeRot(makeBrickGable(16, 12, 5.0, 4.0), PX0 + 0.2, -3.0, Math.PI / 2);
  const sp1 = makeSpiral(false); placeRot(sp1, PX0 + 3.0, -6.2, 0.4); circle(PX0 + 2.6, -6.0, 0.6);
  const sp2 = makeSpiral(true); placeRot(sp2, PX0 + 3.4, 1.4, -2.6); circle(PX0 + 3.5, 1.2, 0.6);
  // white oval-window building on the north side
  const ov = placeRot(makeOvalBuilding(24, 14, 11), -25.5, PZ0 + 0.2, 0);
  // pebble benches in front of it
  [[-35, -11.4, 0.1], [-32.8, -11.6, -0.2], [-30.6, -11.3, 0.3], [-19.6, -11.4, 0.2], [-17.2, -11.5, -0.1], [-15, -11.2, 0.4]].forEach(([x, z, r]) => {
    const b = makePebbleBench(); b.position.set(x, 0, z); b.rotation.y = r; add(b); circle(x, z, 0.4);
  });
  // ornate lamps (lit) round the square
  [[-38.5, -6.5], [-38.5, 8.5], [-30.2, -8.0], [-26.8, 8.5], [-14.0, -6.5], [-14.0, 8.5], [-2.0, 10.8]].forEach(([x, z]) => {
    const l = makeOrnateLamp(); l.position.set(x, 0, z); add(l); circle(x, z, 0.25);
    const pl = new THREE.PointLight('#ffd9a8', 7, 11, 1.5); pl.position.set(x, 3.4, z); add(pl);
  });
  // raised planters with small trees
  [[-33, 0, 3.2, 2.0, 2], [-20, 0, 3.6, 2.2, 5], [-22, 7.5, 2.6, 1.8, 8], [-34, 7.8, 2.2, 1.8, 11]].forEach(([x, z, w, d, sd]) => {
    const p = makePlanter(w, d, sd); p.position.set(x, 0, z); add(p); rect(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  });
}

// ------------------------------------------------------------------ old-town shopping street (city photos, 28b)
// Runs south from the plaza: granite-slab road with white lane markings, shops either side.
{
  const SX = -26.5, Z0 = 11.8, Z1 = 52;
  const st = new THREE.TextureLoader().load('assets/textures/ot_stone.png');
  st.colorSpace = THREE.SRGBColorSpace; st.wrapS = st.wrapT = THREE.RepeatWrapping;
  const stoneMat = new THREE.MeshStandardMaterial({ map: st, roughness: 0.85 });
  add(plane(stoneMat, SX - 7, SX + 7, Z0, Z1, 0.006, 1.2));
  const line = new THREE.MeshStandardMaterial({ color: '#e8e8e2', roughness: 0.8 });
  for (let z = Z0 + 2; z < Z1 - 1; z += 3.2) add(plane(line, SX - 0.08, SX + 0.08, z, z + 1.6, 0.01));
  for (const dx of [-4.6, 4.6]) add(plane(line, SX + dx - 0.07, SX + dx + 0.07, Z0, Z1, 0.01));
  const placeR = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = o.userData.collider; if (!c) return o;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([x, z]) => [gx + x * cs + z * sn, gz - x * sn + z * cs]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
    return o;
  };
  // shops: west side face +x, east side face -x
  const norens = ['#2a3a6a', '#7a1f24', '#2f5a3a', '#4a2a5a', '#8a5a1a'];
  let z = Z0 + 1.5, k = 0;
  for (const w of [6, 5.5, 7, 6, 5, 6.5]) { placeR(makeShopHouse({ w, d: 8, seed: k + 3, front: k % 3 === 2 ? 'lattice' : 'glass', sign: k, noren: norens[k % 5] }), SX - 7, z + w / 2, Math.PI / 2); z += w + 0.3; k++; }
  z = Z0 + 3.5;
  for (const w of [5.5, 6.5, 5, 7, 6]) { placeR(makeShopHouse({ w, d: 8, seed: k + 9, front: k % 3 === 1 ? 'lattice' : 'glass', sign: k, noren: norens[k % 5] }), SX + 7, z + w / 2, -Math.PI / 2); z += w + 0.3; k++; }
  // (the clock tower made way for the station gateway that now ends the street)
  // lamps (lit) + stone bollards + banners along both edges
  for (let zz = Z0 + 4; zz < Z1; zz += 7) for (const s of [-1, 1]) {
    const l = makeOldTownLamp(); l.position.set(SX + s * 6.0, 0, zz); l.rotation.y = s > 0 ? Math.PI : 0; add(l); circle(SX + s * 6.0, zz, 0.2);
    const pl = new THREE.PointLight('#ffd9a8', 6, 11, 1.5); pl.position.set(SX + s * 5.4, 3.3, zz); add(pl);
  }
  let bs = 1;
  for (let zz = Z0 + 2.5; zz < Z1; zz += 2.2) for (const s of [-1, 1]) { if ((zz | 0) % 7 === 0) continue; const b = makeBollard(bs++); b.position.set(SX + s * 5.1, 0, zz); add(b); circle(SX + s * 5.1, zz, 0.25); }
  [[SX - 6.3, Z0 + 9, '#2a4aa8'], [SX - 6.3, Z0 + 23, '#c8202a'], [SX + 6.3, Z0 + 15, '#2a4aa8'], [SX + 6.3, Z0 + 30, '#2a8a4a']].forEach(([x, zz, c], i) => { const b = makeBanner(c, i); b.position.set(x, 0, zz); b.rotation.y = x < SX ? 0 : Math.PI; add(b); });
  // stone monkey statues by a shop door, and the green sign pillar
  const m1 = makeMonkey(); m1.position.set(SX - 5.7, 0, Z0 + 5.5); m1.rotation.y = 0.2; add(m1); circle(SX - 5.7, Z0 + 5.5, 0.4);
  const m2 = makeMonkey(); m2.position.set(SX + 5.7, 0, Z0 + 19); m2.rotation.y = Math.PI - 0.3; add(m2); circle(SX + 5.7, Z0 + 19, 0.4);
  placeR(makeGreenPillar(), SX + 6.4, Z0 + 26, -Math.PI / 2);
}

// ------------------------------------------------------------------ shops off the restaurant strip (city photos, 28c)
// South of the strip that links the plaza to the restaurant, both facing north (-z).
const junkArea = {};
{
  const rotPI = (o, gx, gz, list) => {
    o.position.set(gx, 0, gz); o.rotation.y = Math.PI; add(o);
    for (const [x0, x1, z0, z1] of list) rect(gx - x1, gx - x0, gz - z1, gz - z0);
  };
  const shut = makeShutterShop(10); rotPI(shut, -6.4, 12.2, [shut.userData.collider]);
  const junk = makeJunkShop(9, 12); rotPI(junk, 3.5, 12.2, junk.userData.colliders);
  const a2 = junk.userData.area;
  Object.assign(junkArea, { minX: 3.5 - a2.x1, maxX: 3.5 - a2.x0, minZ: 12.2 - a2.z1, maxZ: 12.2 - a2.z0 });
  // 56 fabrics: a secondhand clothes rack + folded-stack table out on the sidewalk, west of the junk shop door
  const thrift = makeThriftCorner(); rotPI(thrift, 6.4, 10.9, [thrift.userData.collider]);
  const vm = makeVendingMachine(); vm.position.set(-0.85, 0, 11.7); vm.rotation.y = Math.PI; add(vm); rect(-1.25, -0.4, 11.65, 12.45);
}

// ------------------------------------------------------------------ street props (city photos, 28d)
// South edge of the plaza by the old-town street: a closed graffiti shop with a pallet, an arcade
// cabinet outside; two cargo trikes parked on the plaza and on the strip.
{
  const put = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = o.userData.collider; if (!c) return;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([x, z]) => [gx + x * cs + z * sn, gz - x * sn + z * cs]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
  };
  { const gf = makeGraffitiFront(4.4); put(gf, -15.5, 12.1, Math.PI); const c = gf.userData.collider2; rect(-15.5 - c[1], -15.5 - c[0], 12.1 - c[3], 12.1 - c[2]); }
  add(plane(new THREE.MeshStandardMaterial({ color: '#4a4c4e', roughness: 0.9 }), -18.4, -12.6, 12.1, 16, 2.0, 1));
  put(makeArcadeCabinet(), -12.2, 11.55, Math.PI);
  put(makeCargoTrike({ cab: false, seed: 2 }), -19.0, 8.6, 0.0);
  put(makeCargoTrike({ cab: true, seed: 5 }), 0.6, 7.6, Math.PI + 0.15);
}

// ------------------------------------------------------------------ station gateway, lotus pond, rock bar door (city photos, 28e)
{
  const put = (o, gx, gz, rot, list) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const cs = Math.cos(rot), sn = Math.sin(rot);
    for (const c of list) {
      const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([x, z]) => [gx + x * cs + z * sn, gz - x * sn + z * cs]);
      rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
    }
  };
  // station plaza paving (tan + grey squares like the photo) at the end of the old-town street
  const sp = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = r() < 0.15 ? '#e8e2d4' : ['#a8a49c', '#b8b2a6', '#9a968e', '#c4bdb0'][Math.floor(r() * 4)]; x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } return c; })());
  sp.colorSpace = THREE.SRGBColorSpace; sp.wrapS = sp.wrapT = THREE.RepeatWrapping;
  const spMat = new THREE.MeshStandardMaterial({ map: sp, roughness: 0.85 });
  add(plane(spMat, -44, -9, 51.8, 72, 0.007, 4));
  add(plane(spMat, -74, -44, 50.2, 54.2, 0.007, 4));
  const st = makeStationGate(); put(st, -26.5, 57.5, Math.PI, st.userData.colliders);
  const pd = makeLotusPond(26, 28); put(pd, -58.5, 50.2, 0, pd.userData.colliders); pd.position.y = 0.27;
  const rd = makeRockDoor(); put(rd, -38.5, 12.15, Math.PI, rd.userData.colliders);
}

// ------------------------------------------------------------------ underground mall (city photo, 28f)
// The hall lies under the empty block east of the station plaza (world x -5..9, z 23..51); its glass
// stair kiosk stands on a paved forecourt that joins the station plaza.
const MALL = { x: 2, z: 37 };
const mall = makeUndergroundMall();
mall.position.set(MALL.x, 0, MALL.z);
add(mall);
for (const [x0, x1, z0, z1, y0, y1] of mall.userData.colliders) colliders.push({ type: 'box', minX: MALL.x + x0, maxX: MALL.x + x1, minZ: MALL.z + z0, maxZ: MALL.z + z1, y0, y1 });
// ------------------------------------------------------------------ stair entrance to a Go club (city photo, 28g)
// On the forecourt's east edge, facing the mall kiosk; its stair runs east into the building.
const SE = { x: 14, z: 61, rot: -Math.PI / 2 };
const stairEnt = makeStairEntrance();
stairEnt.position.set(SE.x, 0, SE.z); stairEnt.rotation.y = SE.rot; add(stairEnt);
// local (x, z) -> world for this rotation: wx = SE.x - z, wz = SE.z + x
for (const [x0, x1, z0, z1] of stairEnt.userData.colliders) colliders.push({ type: 'box', minX: SE.x - z1, maxX: SE.x - z0, minZ: SE.z + x0, maxZ: SE.z + x1 });
const seArea = (() => { const a = stairEnt.userData.area; return { minX: SE.x - a.maxZ, maxX: SE.x - a.minZ, minZ: SE.z + a.minX, maxZ: SE.z + a.maxX }; })();
// ------------------------------------------------------------------ covered electronics market alley (city photo, 28h)
// Runs south from the forecourt (entrance at world z 49.4) above the underground mall; its colliders
// only apply at street level so they don't block the mall below.
const MA = { x: 9, z: 49.4 };
const alley = makeMarketAlley();
alley.position.set(MA.x, 0, MA.z); add(alley);
for (const [x0, x1, z0, z1] of alley.userData.colliders) colliders.push({ type: 'box', minX: MA.x + x0, maxX: MA.x + x1, minZ: MA.z + z0, maxZ: MA.z + z1, y0: -0.5, y1: 3 });
const maArea = (() => { const a = alley.userData.area; return { minX: MA.x + a.minX, maxX: MA.x + a.maxX, minZ: MA.z + a.minZ, maxZ: MA.z + a.maxZ, y0: -0.5, y1: 0.6 }; })();
// ------------------------------------------------------------------ bar alley (city photo, 28i)
// Opens off the forecourt's north edge (world z 72) and runs north; rotated half a turn, so
// local (x, z) -> world (BA.x - x, BA.z - z).
const BA = { x: -2, z: 72 };
const barAlley = makeBarAlley();
barAlley.position.set(BA.x, 0, BA.z); barAlley.rotation.y = Math.PI; add(barAlley);
for (const [x0, x1, z0, z1] of barAlley.userData.colliders) colliders.push({ type: 'box', minX: BA.x - x1, maxX: BA.x - x0, minZ: BA.z - z1, maxZ: BA.z - z0 });
const baArea = (() => { const a = barAlley.userData.area; return { minX: BA.x - a.maxX, maxX: BA.x - a.minX, minZ: BA.z - a.maxZ, maxZ: BA.z - a.minZ, y0: -0.5, y1: 0.6 }; })();
// the teahouse inside the bar alley (28j): its room + doorway
const teaAreas = barAlley.userData.areas.map((a) => ({ minX: BA.x - a.maxX, maxX: BA.x - a.minX, minZ: BA.z - a.maxZ, maxZ: BA.z - a.minZ, y0: -0.5, y1: 0.6 }));
// ------------------------------------------------------------------ noodle shop + food set 1 remainder (food photos, item 16)
// The shop faces the forecourt from its south-west corner; its bench table holds the rest of food set 1.
const NS = { x: -4.5, z: 49 };
const noodle = makeNoodleShop();
noodle.position.set(NS.x, 0, NS.z); add(noodle);
for (const [x0, x1, z0, z1] of noodle.userData.colliders) colliders.push({ type: 'box', minX: NS.x + x0, maxX: NS.x + x1, minZ: NS.z + z0, maxZ: NS.z + z1, y0: -0.5, y1: 3 });
{
  const t = noodle.userData.table, tx = NS.x + t.x, tz = NS.z + t.z;
  const put = (o, dx, dz, ry = 0) => { o.position.set(tx + dx, t.y, tz + dz); o.rotation.y = ry; add(o); };
  put(makeKatsuCurry(), -0.55, -0.08, 0.1);
  put(makeCornDog(), -0.1, 0.12, 1.35);
  put(makePorkBun(), 0.32, -0.1, -0.4);
  put(makeMelonBread('orange'), 0.62, 0.15, 0);
  put(makeMelonBread('green'), 0.66, -0.17, 0.5);
  put(makeYogurtDrink(), 0.42, 0.2, 0.3);
  put(makeKetchupBottle(), -0.32, -0.24, 0.4);
  put(makeTunaCan(), 0.78, -0.05, 2.2);
  { const t2 = makeTunaCan(); put(t2, 0.78, -0.05, 0.6); t2.position.y += 0.039; }
  put(makeEnergyCan(), 0.12, -0.2, 2.6);
  put(makeUmeSour(), -0.28, 0.22, 2.9);
  put(makeCocoCan(), -0.82, 0.18, 2.4);
  const cand = makeCandyPack(); put(cand, -0.75, -0.2, 0.3); cand.rotation.x = -Math.PI / 2; cand.position.y += 0.007;
  const ch = makeCheeseSticks(); put(ch, 0.05, -0.27, 0.1); ch.rotation.x = -Math.PI / 2 + 0.05; ch.position.y += 0.02; ch.position.z += 0.1;
  const pd = makePizzaDisplay(); pd.position.set(NS.x - 3.2, 0, NS.z + 1.1); pd.rotation.y = 0.15; add(pd);
  rect(NS.x - 3.85, NS.x - 2.55, NS.z + 0.7, NS.z + 1.5);
}
// ------------------------------------------------------------------ abandoned office (grime photos, item 29)
// A vacant unit on the forecourt's north edge, beside the bar alley; rotated half a turn so it faces the
// forecourt: local (x, z) -> world (AO.x - x, AO.z - z).
const AO = { x: 12.4, z: 73.6 };
const abOffice = makeAbandonedOffice();
abOffice.position.set(AO.x, 0, AO.z); abOffice.rotation.y = Math.PI; add(abOffice);
for (const [x0, x1, z0, z1] of abOffice.userData.colliders) colliders.push({ type: 'box', minX: AO.x - x1, maxX: AO.x - x0, minZ: AO.z - z1, maxZ: AO.z - z0 });
const aoAreas = abOffice.userData.areas.map((a) => ({ minX: AO.x - a.maxX, maxX: AO.x - a.minX, minZ: AO.z - a.maxZ, maxZ: AO.z - a.minZ, y0: -0.5, y1: 0.6 }));
aoAreas.push({ minX: 8.4, maxX: 15.9, minZ: 69, maxZ: 73.2, y0: -0.5, y1: 0.6 });     // the strip of forecourt in front of it
add(plane(new THREE.MeshStandardMaterial({ color: '#5a5650', roughness: 0.9 }), 8.2, 16.4, 72, 73.7, 0.006, 1));
// ------------------------------------------------------------------ the Knot Room bar (grime photos, item 30)
// On the forecourt's east edge between the Go-club building and the abandoned office, front facing west.
// rotation -90 deg: local (x, z) -> world (KR.x - z, KR.z + x)
const KR = { x: 14.4, z: 69.5 };
const knot = makeKnotRoom();
knot.position.set(KR.x, 0, KR.z); knot.rotation.y = -Math.PI / 2; add(knot);
for (const [x0, x1, z0, z1] of knot.userData.colliders) colliders.push({ type: 'box', minX: KR.x - z1, maxX: KR.x - z0, minZ: KR.z + x0, maxZ: KR.z + x1 });
const krAreas = knot.userData.areas.map((a) => ({ minX: KR.x - a.maxZ, maxX: KR.x - a.minZ, minZ: KR.z + a.minX, maxZ: KR.z + a.maxX, y0: -0.5, y1: 0.6 }));
// ======== main.js 1297-1312 (the forecourt paving) ========
{
  // forecourt: rain-soaked concrete slabs with puddles (rainy-plaza photo, 28k), cut around the stair well
  const tl = new THREE.TextureLoader();
  const ld = (n, srgb) => { const t = tl.load('assets/textures/' + n); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  const slabC = ld('rp_slab.png', true), slabR = ld('rp_slab_r.png', false);
  const slabM = new THREE.MeshStandardMaterial({ map: slabC, roughnessMap: slabR, roughness: 1, metalness: 0.05 });
  for (const [a, b, c, d] of [[-9, 0.2, 49, 72], [3.8, 14, 49, 72], [0.2, 3.8, 49, 50.9], [0.2, 3.8, 58.7, 72]]) add(plane(slabM, a, b, c, d, 0.007, 3));
  // two paved walkways across it (sidewalk-tiles photo): dark pavers with light-grey edge bands, moss in the joints
  const pvD = ld('mp_paver.png', true), pvL = ld('mp_paver_light.png', true);
  const pvMats = new Map();
  const pv = (tex, a, b, c, d, y) => { if (!pvMats.has(tex)) pvMats.set(tex, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })); add(plane(pvMats.get(tex), a, b, c, d, y, 0.9)); };
  // north-south to the bar alley mouth (x -4.2..0.2), east-west from the mall kiosk to the Go-club stairs
  pv(pvL, -4.4, -0.0, 59.4, 72, 0.009); pv(pvD, -3.5, -0.9, 59.4, 72, 0.010);
  pv(pvL, -4.4, 14, 59.4, 63.0, 0.0095); pv(pvD, -3.5, 14, 60.3, 62.1, 0.0105);
}

// ======== end of main.js lines ========
  const mallAreas = mall.userData.areas.map((a) => ({ ...a, minX: a.minX + MALL.x, maxX: a.maxX + MALL.x, minZ: a.minZ + MALL.z, maxZ: a.maxZ + MALL.z }));
  const areas = [
    { minX: -43.6, maxX: -9.0, minZ: -13.6, maxZ: 11.7 }, // city plaza
    { minX: -33.3, maxX: -19.7, minZ: 11.0, maxZ: 51.8 }, // old-town street
    { minX: -43.8, maxX: -9.2, minZ: 51.0, maxZ: 70.0 }, // station plaza
    { minX: -73.6, maxX: -43.0, minZ: 50.6, maxZ: 54.0 }, // pond-side path
    { minX: -9.5, maxX: 9.0, minZ: 5.4, maxZ: 11.7 }, // strip toward the way out
    junkArea, // junk shop interior
    { minX: -9.2, maxX: 13.7, minZ: 49.5, maxZ: 69.7, y0: -0.5, y1: 0.6 }, // underground-mall forecourt (street level)
    ...mallAreas, seArea, maArea, baArea, ...teaAreas, ...aoAreas, ...krAreas,
    { minX: -19.6, maxX: -9.2, minZ: 48.0, maxZ: 52.0 }, // strip joining the street to the forecourt
  ];
  const ground = (x, z, prevY) => { const my = mall.userData.floorY(x - MALL.x, z - MALL.z, prevY); if (my !== null) return my; const sy = stairEnt.userData.floorY(z - SE.z, SE.x - x); if (sy !== null) return sy; return 0; };
  return { areas, ground };
}
