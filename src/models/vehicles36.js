// Vehicles (queue item 36, photos/vehicles/). All names and markings made up; no plates.
//   makeKeiTruck()  white kei mini-truck on recycling rounds (kei-truck-recycling.jpg): 3.4 m x 1.48 m, the
//   cab's outline traced from the side photo with the photo itself on both doors (window + interior, handle,
//   mirror, grime); flat-deck bed with the photo's side panels and a made-up company name; steel wheels from
//   the photo; white pipe headache rack + black roof rack; loaded with string-tied newspaper bundles,
//   a cardboard box, carrier bags and flattened cardboard, tied down with rope. Nose toward +x, ground y = 0.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name, rep) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t; }
function box(w, h, d, mat, x, y, z, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function tube(a, b, r, mat, parent) {
  const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat);
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; parent.add(m); return m;
}

export function makeKeiTruck() {
  const g = new THREE.Group(); g.name = 'kei_truck';
  // photo thumbnail (1050 px wide) -> metres: 762 px nose-to-tail = 3.395 m; ground at py 850
  const P = 3.395 / 762, X = (px) => (536 - px) * P, Y = (py) => (850 - py) * P, Wd = 1.475, hw = Wd / 2;
  const paint = new THREE.MeshStandardMaterial({ color: '#e4e4e0', roughness: 0.5, metalness: 0.1 });
  const black = new THREE.MeshStandardMaterial({ color: '#1c1c1e', roughness: 0.8 });
  const under = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: '#2a3238', roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.85 });

  // ---- cab: traced side outline extruded the full width; both sides carry the photo
  const pts = [[158, 778], [155, 700], [156, 640], [162, 618], [180, 598], [198, 582], [226, 540], [244, 500], [258, 474], [272, 466], [440, 464], [452, 468], [458, 476], [459, 780]];
  const a0 = Math.asin(15 / 80);
  for (let i = 0; i <= 16; i++) { const a = a0 + (Math.PI - 2 * a0) * i / 16; pts.push([332 + 80 * Math.cos(a), 795 - 80 * Math.sin(a)]); }
  const sh = new THREE.Shape(); pts.forEach(([px, py], i) => (i ? sh.lineTo(X(px), Y(py)) : sh.moveTo(X(px), Y(py))));
  const cg = new THREE.ExtrudeGeometry(sh, { depth: Wd - 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 4 });
  cg.translate(0, 0, -(Wd - 0.03) / 2);
  const cp = cg.attributes.position, cuv = cg.attributes.uv;
  for (let i = 0; i < cp.count; i++) { const px = 536 - cp.getX(i) / P, py = 850 - cp.getY(i) / P; cuv.setXY(i, (px - 150) / 312, 1 - (py - 455) / 330); }
  const cabSide = new THREE.MeshStandardMaterial({ map: tex('kt_cab'), roughness: 0.45, metalness: 0.05 });
  const cab = new THREE.Mesh(cg, [cabSide, paint]); cab.castShadow = true; cab.receiveShadow = true; g.add(cab);
  // windscreen on the sloped front, rear window on the back wall
  const ws0 = new THREE.Vector2(X(200), Y(580)), ws1 = new THREE.Vector2(X(256), Y(478)), wl = ws0.distanceTo(ws1);
  const wsm = new THREE.Mesh(new THREE.PlaneGeometry(Wd - 0.16, wl), glass);
  wsm.rotation.order = 'ZYX'; wsm.rotation.y = Math.PI / 2; wsm.rotation.z = Math.atan2(ws0.x - ws1.x, ws1.y - ws0.y);
  wsm.position.set((ws0.x + ws1.x) / 2 + 0.012, (ws0.y + ws1.y) / 2 + 0.008, 0); g.add(wsm);
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(Wd - 0.3, Y(486) - Y(560)), glass); rw.rotation.y = -Math.PI / 2; rw.position.set(X(459) - 0.017, Y(523), 0); g.add(rw);
  // wipers
  for (const z of [-0.3, 0.2]) { const wp = box(0.02, 0.012, 0.45, black, X(198) + 0.01, Y(578), z, g); wp.rotation.x = 0.15; }
  // front face: grille slot, two headlights from the photo, grey bumper, small indicator lamps
  const fx = X(156) + 0.017;
  box(0.02, Y(700) - Y(720), Wd - 0.5, black, fx, Y(710), 0, g);
  const lampM = new THREE.MeshStandardMaterial({ map: tex('kt_lamp'), roughness: 0.15, emissive: '#222', emissiveIntensity: 0.2 });
  for (const z of [-1, 1]) {
    const lp = new THREE.Mesh(new THREE.PlaneGeometry(0.2, Y(636) - Y(682)), lampM); lp.rotation.y = Math.PI / 2; lp.position.set(fx + 0.003, Y(659), z * (hw - 0.14)); g.add(lp);
    box(0.02, 0.035, 0.07, new THREE.MeshStandardMaterial({ color: '#e08a20', roughness: 0.3, emissive: '#5a3000', emissiveIntensity: 0.3 }), fx, Y(735), z * (hw - 0.12), g);
  }
  box(0.08, Y(752) - Y(782), Wd + 0.01, new THREE.MeshStandardMaterial({ color: '#c8c8c4', roughness: 0.6 }), X(160), Y(767), 0, g);
  // door mirrors (stalk + black housing) and drip-rail visors over the side windows
  for (const z of [-1, 1]) {
    const m = box(0.05, 0.13, 0.1, black, X(200), Y(560), z * (hw + 0.08), g);
    box(0.03, 0.02, 0.1, black, X(205), Y(578), z * (hw + 0.03), g); m.rotation.y = z * 0.2;
    const vis = box(X(258) - X(440), 0.012, 0.05, new THREE.MeshStandardMaterial({ color: '#202428', roughness: 0.3, transparent: true, opacity: 0.8 }), (X(258) + X(440)) / 2, Y(478), z * (hw + 0.02), g); vis.rotation.x = z * -0.5;
  }

  // ---- bed: flat deck with three drop sides (the photo's panel outside) and the made-up name
  const bx0 = X(459) - 0.01, bx1 = X(917), bl = bx0 - bx1, bmx = (bx0 + bx1) / 2, deckY = Y(700), topY = Y(640), botY = Y(716), ph = topY - botY;
  box(bl, 0.04, Wd - 0.04, new THREE.MeshStandardMaterial({ color: '#b8b8b4', roughness: 0.85 }), bmx, deckY, 0, g);
  const bedT = tex('kt_bed');
  const bedOut = new THREE.MeshStandardMaterial({ map: bedT, roughness: 0.5 });
  for (const z of [-1, 1]) {
    box(bl, ph, 0.03, paint, bmx, (topY + botY) / 2, z * (hw - 0.015), g);
    // -z side reads front-to-back as photographed; +z side is the mirror image
    let fm = bedOut; if (z > 0) { const t = tex('kt_bed', true); t.repeat.x = -1; fm = new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }); }
    const face = new THREE.Mesh(new THREE.PlaneGeometry(bl, ph), fm); face.position.set(bmx, (topY + botY) / 2, z * (hw + 0.0005)); face.rotation.y = z > 0 ? 0 : Math.PI; g.add(face);
    // made-up company name where the real one was, navy like the photo
    const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#1f3c8c'; fitText(x, 'ひばり資源回収㈲', 512, 66, 960, 110, F.antique, { spacing: 10 });
    const nt = new THREE.CanvasTexture(c); nt.colorSpace = THREE.SRGBColorSpace;
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(X(550) - X(812), (Y(668) - Y(696))), new THREE.MeshStandardMaterial({ map: nt, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }));
    nm.position.set((X(550) + X(812)) / 2, Y(682), z * (hw + 0.002)); nm.rotation.y = z > 0 ? 0 : Math.PI; g.add(nm);
  }
  box(0.03, ph, Wd, paint, bx1 + 0.015, (topY + botY) / 2, 0, g);                                       // tailgate
  const tg = new THREE.Mesh(new THREE.PlaneGeometry(Wd, ph), new THREE.MeshStandardMaterial({ map: (() => { const t = tex('kt_bed'); t.repeat.set(0.62, 1); t.offset.set(0.36, 0); return t; })(), roughness: 0.5 }));
  tg.rotation.y = -Math.PI / 2; tg.position.set(bx1 - 0.001, (topY + botY) / 2, 0); g.add(tg);
  box(0.03, ph, Wd, paint, bx0 - 0.015, (topY + botY) / 2, 0, g);                                       // front gate
  // tail lamps + rear bumper step under the tailgate
  for (const z of [-1, 1]) box(0.04, 0.09, 0.16, new THREE.MeshStandardMaterial({ color: '#b01818', roughness: 0.25, emissive: '#400000', emissiveIntensity: 0.4 }), bx1 - 0.02, Y(735), z * (hw - 0.14), g);
  box(0.06, 0.05, Wd - 0.2, black, bx1, Y(752), 0, g);
  // headache rack: white pipe frame on the front gate, up to the roof line
  const pipe = new THREE.MeshStandardMaterial({ color: '#e8e8e4', roughness: 0.4, metalness: 0.2 });
  const rx = bx0 - 0.04;
  for (const z of [-1, 1]) tube(new THREE.Vector3(rx, topY, z * (hw - 0.06)), new THREE.Vector3(rx, Y(470), z * (hw - 0.06)), 0.016, pipe, g);
  tube(new THREE.Vector3(rx, Y(470), -(hw - 0.06)), new THREE.Vector3(rx, Y(470), hw - 0.06), 0.016, pipe, g);
  for (const y of [Y(530), Y(590)]) tube(new THREE.Vector3(rx, y, -(hw - 0.06)), new THREE.Vector3(rx, y, hw - 0.06), 0.011, pipe, g);
  for (const z of [-0.25, 0, 0.25]) tube(new THREE.Vector3(rx, topY, z), new THREE.Vector3(rx, Y(470), z), 0.009, pipe, g);
  // roof rack: black rails from over the windscreen back over the bed, feet on the gutters
  const rack = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.6, metalness: 0.3 });
  const ry = Y(436);
  for (const z of [-1, 1]) {
    tube(new THREE.Vector3(X(276), ry, z * (hw - 0.05)), new THREE.Vector3(X(600), ry, z * (hw - 0.05)), 0.014, rack, g);
    for (const px of [290, 430]) tube(new THREE.Vector3(X(px), Y(466), z * (hw - 0.05)), new THREE.Vector3(X(px), ry, z * (hw - 0.05)), 0.012, rack, g);
    tube(new THREE.Vector3(X(560), Y(472), z * (hw - 0.06)), new THREE.Vector3(X(560), ry, z * (hw - 0.05)), 0.012, rack, g);
  }
  for (let px = 280; px <= 600; px += 40) tube(new THREE.Vector3(X(px), ry + 0.01, -(hw - 0.05)), new THREE.Vector3(X(px), ry + 0.01, hw - 0.05), 0.01, rack, g);

  // ---- chassis, fuel tank, wheels
  box(X(300) - X(905), 0.12, Wd - 0.45, under, (X(300) + X(905)) / 2, Y(735), 0, g);
  box(X(578) - X(632), Y(748) - Y(796), 0.45, new THREE.MeshStandardMaterial({ color: '#b4b8bc', roughness: 0.5, metalness: 0.5 }), (X(578) + X(632)) / 2, Y(772), -0.2, g);
  const wheelM = new THREE.MeshStandardMaterial({ map: tex('kt_wheel'), roughness: 0.6, metalness: 0.15, transparent: true, alphaTest: 0.5 });
  const tyre = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 });
  const R = 57 * P, TW = 0.15;
  for (const [px, py] of [[332.5, 795], [767.5, 797]]) for (const z of [-1, 1]) {
    const wz = z * (hw - TW / 2 - 0.02);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.97, R * 0.97, TW, 32), tyre); t.rotation.x = Math.PI / 2; t.position.set(X(px), R * 0.97, wz); t.castShadow = true; g.add(t);
    const f = new THREE.Mesh(new THREE.CircleGeometry(R, 40), wheelM); f.position.set(X(px), R * 0.97, wz + z * (TW / 2 + 0.001)); f.rotation.y = z > 0 ? 0 : Math.PI; g.add(f);
  }
  box(0.04, 0.04, Wd - 0.4, under, X(332), R, 0, g); box(0.06, 0.06, Wd - 0.4, under, X(767), R, 0, g);   // axles
  for (const z of [-1, 1]) box(0.02, 0.2, 0.22, black, X(860), Y(735), z * (hw - 0.17), g);               // mud flaps

  // ---- the load: string-tied newspaper bundles, a cardboard box, carrier bags, flat cardboard, rope
  const ld = new THREE.Group(); g.add(ld);
  const paperM = new THREE.MeshStandardMaterial({ map: tex('kt_paper'), roughness: 0.9 });
  const paperTop = new THREE.MeshStandardMaterial({ map: tex('kt_paper'), color: '#d8d6cf', roughness: 0.95 });
  const string = new THREE.MeshStandardMaterial({ color: '#c8b48a', roughness: 0.9 });
  const ropeM = new THREE.MeshStandardMaterial({ color: '#8a7448', roughness: 0.95 });
  const base = deckY + 0.02;
  const bundle = (x, y, z, ry, w = 0.42, h = 0.24, d = 0.32) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [paperM, paperM, paperTop, paperM, paperM, paperM]); b.position.set(x, y + h / 2, z); b.rotation.y = ry; b.castShadow = true; ld.add(b);
    for (const k of [-0.25, 0.25]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.006, h + 0.004, d + 0.004), string); s.position.set(k * w, 0, 0); b.add(s); }
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(w + 0.004, h + 0.004, 0.006), string); b.add(s2);
    return b;
  };
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // bundles packed tight, standing on edge (paper edges outward), a second layer at the front
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) bundle(bx0 - 0.23 - i * 0.39, base, -0.53 + j * 0.355, (rnd() - 0.5) * 0.06, 0.37 + rnd() * 0.03, 0.22 + rnd() * 0.05, 0.33);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) if (rnd() > 0.3) bundle(bx0 - 0.25 - i * 0.4 + (rnd() - 0.5) * 0.05, base + 0.25, -0.52 + j * 0.35, (rnd() - 0.5) * 0.25, 0.36, 0.18 + rnd() * 0.04, 0.3);
  const cbox = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.34), new THREE.MeshStandardMaterial({ map: tex('kt_box'), roughness: 0.85 }));
  cbox.position.set(bx0 - 0.25, base + 0.25 + 0.2 + 0.11, 0.47); cbox.rotation.y = 0.05; cbox.castShadow = true; ld.add(cbox);
  // carrier bags: lumpy, knotted at the top, crumpled into the gaps of the pile
  const bagGeo = (r) => {
    const gg = new THREE.IcosahedronGeometry(r, 3), q = gg.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < q.count; i++) {
      v.fromBufferAttribute(q, i); const n = 1 + 0.12 * Math.sin(v.x * 41 + v.y * 23) * Math.cos(v.z * 37) + 0.06 * Math.sin(v.y * 90 + v.x * 60);
      v.multiplyScalar(n); if (v.y < -r * 0.3) v.y = -r * 0.3 - (v.y + r * 0.3) * 0.15; q.setXYZ(i, v.x, v.y, v.z);
    }
    gg.computeVertexNormals(); return gg;
  };
  for (let i = 0; i < 5; i++) {
    const bm = new THREE.MeshStandardMaterial({ color: i === 1 || i === 4 ? '#e6a8ae' : '#ecece6', roughness: 0.35, transparent: true, opacity: 0.9 });
    const bag = new THREE.Group(), body = new THREE.Mesh(bagGeo(0.13), bm); body.scale.set(1.3, 0.75, 1); bag.add(body);
    for (const k of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), bm); ear.position.set(k * 0.04, 0.11, 0); ear.rotation.z = -k * 0.5; bag.add(ear); }
    bag.position.set(bx0 - 0.55 - i * 0.22, base + 0.47 + rnd() * 0.04, -0.45 + rnd() * 0.75); bag.rotation.set((rnd() - 0.5) * 0.4, rnd() * 6, (rnd() - 0.5) * 0.4); ld.add(bag);
  }
  // flattened cardboard stacked at the tail, tied
  for (let i = 0; i < 6; i++) { const f = box(0.7, 0.012, 0.95, new THREE.MeshStandardMaterial({ color: i % 2 ? '#b89064' : '#c49c6c', roughness: 0.9 }), bx1 + 0.42 + (rnd() - 0.5) * 0.04, base + 0.006 + i * 0.013, (rnd() - 0.5) * 0.05, ld); f.rotation.y = (rnd() - 0.5) * 0.08; }
  // tie-down ropes over the load to the side hooks
  for (const rxp of [bx0 - 0.6, bx0 - 1.3, bx1 + 0.4]) {
    const top = rxp < bx1 + 0.5 && rxp > bx1 + 0.3 ? base + 0.09 : base + 0.5;
    const pts3 = [new THREE.Vector3(rxp, botY + 0.02, -hw - 0.01), new THREE.Vector3(rxp, topY + 0.02, -hw + 0.02), new THREE.Vector3(rxp, top, -0.3), new THREE.Vector3(rxp, top, 0.3), new THREE.Vector3(rxp, topY + 0.02, hw - 0.02), new THREE.Vector3(rxp, botY + 0.02, hw + 0.01)];
    const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts3), 40, 0.006, 6), ropeM); ld.add(rope);
  }
  return g;
}
