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

// ---------------------------------------------------------------------------------------------------------
//   makeCoachBus()  long-distance coach, red with gold (red-coach-bus-front/-rear.jpg): 12 m x 2.49 m x 3.5 m.
//   The rear is the photo itself (lamps, gold band, chrome strip, spoiler) with the real lettering, logo and
//   plate painted out and a made-up line name ("NOVA EXPRESS", operator "Hoshizora Kotsu") lettered on;
//   sides painted from the photo's colours: tinted window band with black pillars, the gold sweep rising from
//   the nose to the window line, a made-up comet emblem; passenger door + glass on the kerb (left) side;
//   front: deep black windscreen, red nose with gold band, the photo's headlights, mirror arms.
//   Nose toward +x, ground y = 0.
const CB = { L: 12, W: 2.49, H: 3.5, clr: 0.32 };
function cometEmblem(x, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  const gd = x.createLinearGradient(-120, -60, 120, 60); gd.addColorStop(0, '#f6dc8c'); gd.addColorStop(0.5, '#c89a3c'); gd.addColorStop(1, '#f0d27a');
  x.fillStyle = gd;
  for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-150, -40 + i * 34); x.quadraticCurveTo(0, -60 + i * 30, 70, -10 + i * 8); x.lineTo(70, 2 + i * 8); x.quadraticCurveTo(0, -46 + i * 32, -150, -28 + i * 34); x.fill(); }
  x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 22 : 56, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(80 + Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill();
  x.restore();
}
function coachSide(kerb) {
  const { L, H } = CB, S = 340, W = Math.round(L * S), Hh = Math.round(H * S), c = document.createElement('canvas'); c.width = W; c.height = Hh; const x = c.getContext('2d');
  const Y = (m) => Hh - m * S, Xf = (m) => W - m * S;          // m from the nose (canvas right = nose)
  const red = x.createLinearGradient(0, 0, 0, Hh); red.addColorStop(0, '#c41a28'); red.addColorStop(0.55, '#b0121f'); red.addColorStop(1, '#8a0c16');
  x.fillStyle = red; x.fillRect(0, 0, W, Hh);
  // window band: tinted glass with black pillars, a little sky reflection
  const wy0 = Y(3.12), wy1 = Y(1.86);
  const gl = x.createLinearGradient(0, wy0, 0, wy1); gl.addColorStop(0, '#2c3238'); gl.addColorStop(0.35, '#151a1e'); gl.addColorStop(1, '#0b0d10');
  x.fillStyle = '#0b0b0c'; x.fillRect(Xf(L - 0.25), wy0 - 10, (L - 2.3) * S, wy1 - wy0 + 20);
  x.fillStyle = gl; for (let m = 2.6; m < L - 0.6; m += 1.42) x.fillRect(Xf(m + 1.32), wy0, 1.32 * S, wy1 - wy0);
  x.fillStyle = 'rgba(200,220,235,0.07)'; for (let m = 2.6; m < L - 0.6; m += 1.42) { x.beginPath(); x.moveTo(Xf(m + 1.3), wy0); x.lineTo(Xf(m + 0.9), wy0); x.lineTo(Xf(m + 1.3), wy0 + 120); x.fill(); }
  // driver's side window / door glass up front
  x.fillStyle = gl; x.fillRect(Xf(2.45), Y(3.0), 1.6 * S, Y(1.25) - Y(3.0));
  if (kerb) { x.fillStyle = '#0b0b0c'; x.fillRect(Xf(1.95), Y(3.05), 1.0 * S, Y(0.45) - Y(3.05)); x.fillStyle = gl; x.fillRect(Xf(1.88), Y(2.95), 0.86 * S, Y(1.6) - Y(2.95)); x.fillRect(Xf(1.88), Y(1.45), 0.86 * S, Y(0.8) - Y(1.45)); }
  // the gold sweep: low at the nose, curving up to run under the windows, thin gold line along the skirt
  const gd = x.createLinearGradient(0, Y(2), 0, Y(1.3)); gd.addColorStop(0, '#e8c878'); gd.addColorStop(0.5, '#c39436'); gd.addColorStop(1, '#a87a24');
  x.fillStyle = gd; x.beginPath();
  x.moveTo(W, Y(1.22)); x.bezierCurveTo(Xf(1.5), Y(1.28), Xf(2.8), Y(1.6), Xf(4.2), Y(1.86)); x.lineTo(0, Y(1.86)); x.lineTo(0, Y(1.74));
  x.lineTo(Xf(4.3), Y(1.74)); x.bezierCurveTo(Xf(2.8), Y(1.44), Xf(1.5), Y(1.08), W, Y(1.02)); x.fill();
  x.fillStyle = '#b88a30'; x.fillRect(0, Y(0.48), W, 6);
  // fuel flap, luggage bay seams, side marker lamps, grime along the skirt
  x.strokeStyle = 'rgba(40,0,6,0.55)'; x.lineWidth = 3;
  for (const [a, b] of [[3.4, 5.0], [5.1, 6.7], [9.6, 10.9]]) x.strokeRect(Xf(b), Y(1.55), (b - a) * S, Y(0.5) - Y(1.55));
  x.fillStyle = '#f08a10'; for (let m = 1.2; m < L; m += 2.3) x.fillRect(Xf(m), Y(0.62), 26, 12);
  const dirt = x.createLinearGradient(0, Y(0.9), 0, Hh); dirt.addColorStop(0, 'rgba(60,40,30,0)'); dirt.addColorStop(1, 'rgba(60,40,30,0.35)'); x.fillStyle = dirt; x.fillRect(0, Y(0.9), W, Y(0) - Y(0.9));
  // the kerb side is shown mirrored (nose at the canvas left): flip the paintwork, then letter it unmirrored
  let out = c, X2 = Xf;
  if (kerb) { out = document.createElement('canvas'); out.width = W; out.height = Hh; const o = out.getContext('2d'); o.drawImage(c, 0, 0); o.translate(W, 0); o.scale(-1, 1); X2 = (m) => m * S; }   // seen from behind: paint as-is, lettering mirrored
  {
    const x = out.getContext('2d'), Xf = X2;
    x.fillStyle = '#d9b45c'; fitText(x, 'NOVA EXPRESS', Xf(5.6), Y(1.45), 3.2 * S, 0.34 * S, F.seventies, { spacing: 18, weight: 'italic' });
    cometEmblem(x, Xf(9.4), Y(1.15), kerb ? -2.6 : 2.6);
    x.fillStyle = '#e6d2a0'; fitText(x, 'HOSHIZORA KOTSU', Xf(2.95), Y(1.55), 1.0 * S, 0.1 * S, F.roman, { spacing: 4 });
  }
  const t = new THREE.CanvasTexture(out); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function coachFront() {
  const { W: Wd, H } = CB, S = 300, w = Math.round(Wd * S), h = Math.round(H * S), c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const Y = (m) => h - m * S;
  x.fillStyle = '#b4121f'; x.fillRect(0, 0, w, h);
  // huge black windscreen with the destination box at the top, a sun visor line
  x.fillStyle = '#0c0e10'; x.beginPath(); x.roundRect(14, Y(3.38), w - 28, Y(1.3) - Y(3.38), 30); x.fill();
  const gl = x.createLinearGradient(0, Y(3.3), 0, Y(1.4)); gl.addColorStop(0, '#2e3a42'); gl.addColorStop(1, '#0e1114');
  x.fillStyle = gl; x.beginPath(); x.roundRect(30, Y(3.05), w - 60, Y(1.42) - Y(3.05), 22); x.fill();
  x.fillStyle = '#05140a'; x.fillRect(w * 0.18, Y(3.32), w * 0.64, 0.2 * S);
  x.fillStyle = '#ffb030'; x.font = `${0.13 * S}px ${F.led}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NOVA EXPRESS  ·  CHARTER', w / 2, Y(3.22));
  // gold band across the nose, the operator name in the black, grille slats
  const gd = x.createLinearGradient(0, Y(1.32), 0, Y(1.05)); gd.addColorStop(0, '#ecd084'); gd.addColorStop(1, '#a87a24');
  x.fillStyle = gd; x.fillRect(0, Y(1.3), w, Y(1.05) - Y(1.3));
  x.fillStyle = '#e8d6a8'; fitText(x, 'HOSHIZORA KOTSU', w / 2, Y(1.52), 1.0 * S, 0.11 * S, F.roman, { spacing: 4 });
  x.fillStyle = '#5a0a10'; for (let i = 0; i < 3; i++) x.fillRect(w * 0.3, Y(0.92) + i * 18, w * 0.4, 7);
  x.fillStyle = '#9a0e1a'; x.fillRect(0, Y(0.35), w, Y(0) - Y(0.35));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
export function makeCoachBus() {
  const g = new THREE.Group(); g.name = 'coach_bus';
  const { L, W: Wd, H, clr } = CB, hw = Wd / 2;
  const axF = L - 2.55, axR = L - 2.55 - 6.0, R = 0.5;
  // side profile (s = 0 at the tail, L at the nose): rounded roof edges, spoiler cap at the back, arches
  const sh = new THREE.Shape();
  sh.moveTo(0.02, clr);
  const arch = (cx) => { sh.lineTo(cx - 0.62, clr); sh.absarc(cx, clr, 0.62, Math.PI, 0, true); };
  arch(axR); arch(axF);
  sh.lineTo(L - 0.1, clr); sh.quadraticCurveTo(L, clr, L, clr + 0.15); sh.lineTo(L - 0.02, 3.0);
  sh.quadraticCurveTo(L - 0.06, H, L - 0.5, H); sh.lineTo(0.35, H); sh.quadraticCurveTo(-0.02, H, 0, H - 0.3); sh.lineTo(0.02, clr);
  const body = new THREE.ExtrudeGeometry(sh, { depth: Wd - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 10 });
  body.translate(-L / 2, 0, -(Wd - 0.06) / 2);
  const paint = new THREE.MeshStandardMaterial({ color: '#b5141f', roughness: 0.25, metalness: 0.25 });
  const shell = new THREE.Mesh(body, [new THREE.MeshBasicMaterial({ visible: false }), paint]); shell.castShadow = true; g.add(shell);
  // the two painted sides (left = kerb side with the door in Japan) as their own caps
  for (const z of [-1, 1]) {
    const geo = new THREE.ShapeGeometry(sh, 10); geo.translate(-L / 2, 0, 0);
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) { const u = (p.getX(i) + L / 2) / L; uv.setXY(i, u, p.getY(i) / H); }
    const side = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: coachSide(z < 0), roughness: 0.28, metalness: 0.2 }));
    side.position.z = z * (hw + 0.002);
    if (z < 0) side.material.side = THREE.BackSide;
    g.add(side);
  }
  // front face + the photo's headlights; rear = the photo
  const front = new THREE.Mesh(new THREE.PlaneGeometry(Wd, H - 0.32), new THREE.MeshStandardMaterial({ map: coachFront(), roughness: 0.2, metalness: 0.2 }));
  front.material.map.repeat.set(1, (H - 0.32) / H); front.material.map.offset.set(0, 0.32 / H);
  front.rotation.y = Math.PI / 2; front.position.set(L / 2 + 0.035, clr + (H - 0.32) / 2 - 0.0, 0); g.add(front);
  const lampT = tex('cb_lamp');
  for (const z of [-1, 1]) { const lp = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.28), new THREE.MeshStandardMaterial({ map: lampT, roughness: 0.15 })); lp.rotation.y = Math.PI / 2; lp.position.set(L / 2 + 0.04, 0.78, z * (hw - 0.3)); g.add(lp); }
  const rearT = tex('cb_rear');
  const rear = new THREE.Mesh(new THREE.PlaneGeometry(Wd, H - clr - 0.05), new THREE.MeshStandardMaterial({ map: rearT, roughness: 0.25, metalness: 0.15 }));
  rear.rotation.y = -Math.PI / 2; rear.position.set(-L / 2 - 0.035, clr + (H - clr - 0.05) / 2, 0); g.add(rear);
  // made-up name on the rear: an overlay where the real lettering was painted out, and our emblem on the glass divider
  {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1360; const x = c.getContext('2d');
    x.fillStyle = '#d9b45c'; fitText(x, 'NOVA EXPRESS', 512, 1360 * 0.6, 880, 90, F.seventies, { spacing: 14 });
    cometEmblem(x, 470, 1360 * 0.17, 0.85);
    x.fillStyle = '#e6d6b0'; fitText(x, 'HOSHIZORA KOTSU', 820, 1360 * 0.8, 200, 30, F.roman, { spacing: 3 }); fitText(x, 'PREMIUM', 820, 1360 * 0.83, 120, 20, F.roman, { spacing: 4 });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const ov = new THREE.Mesh(rear.geometry, new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -2 }));
    ov.rotation.y = -Math.PI / 2; ov.position.copy(rear.position); ov.position.x -= 0.002; g.add(ov);
  }
  // mirror arms reaching forward like antennae, black housings
  const blk = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.4 });
  for (const z of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 20, Math.PI * 0.6), blk); arm.position.set(L / 2 - 0.05, 2.75, z * (hw + 0.05)); arm.rotation.set(0, z > 0 ? -Math.PI / 2 : Math.PI / 2, 0); arm.rotation.z = 0; g.add(arm);
    box(0.08, 0.5, 0.22, blk, L / 2 + 0.38, 2.4, z * (hw - 0.05), g);
  }
  // wipers resting on the screen
  for (const z of [-0.5, 0.45]) box(0.02, 0.03, 0.85, blk, L / 2 + 0.05, 1.5, z, g).rotation.x = 0.2;
  // wheels: polished aluminium discs (8 hand-holes), dual at the rear, black tyres
  const wc = document.createElement('canvas'); wc.width = wc.height = 256; const wx = wc.getContext('2d');
  const rg = wx.createRadialGradient(128, 128, 10, 128, 128, 128); rg.addColorStop(0, '#d8dcdf'); rg.addColorStop(0.6, '#b8bcc0'); rg.addColorStop(0.72, '#7a7e82'); rg.addColorStop(0.74, '#151515'); rg.addColorStop(1, '#202020');
  wx.fillStyle = rg; wx.fillRect(0, 0, 256, 256);
  wx.fillStyle = '#2a2a2c'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; wx.beginPath(); wx.ellipse(128 + Math.cos(a) * 62, 128 + Math.sin(a) * 62, 14, 9, a, 0, 7); wx.fill(); }
  wx.fillStyle = '#9a9ea2'; wx.beginPath(); wx.arc(128, 128, 30, 0, 7); wx.fill(); wx.fillStyle = '#666'; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; wx.beginPath(); wx.arc(128 + Math.cos(a) * 42, 128 + Math.sin(a) * 42, 4, 0, 7); wx.fill(); }
  const wt = new THREE.CanvasTexture(wc); wt.colorSpace = THREE.SRGBColorSpace;
  const tyre = new THREE.MeshStandardMaterial({ color: '#161616', roughness: 0.9 }), disc = new THREE.MeshStandardMaterial({ map: wt, roughness: 0.3, metalness: 0.6 });
  for (const ax of [axF, axR]) for (const z of [-1, 1]) {
    const tw = ax === axR ? 0.55 : 0.3, wz = z * (hw - tw / 2 - 0.02);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(R, R, tw, 36), [tyre, disc, disc]); t.rotation.x = Math.PI / 2; t.position.set(ax - L / 2, R, wz); t.castShadow = true; g.add(t);
    if (z < 0) t.rotation.x = -Math.PI / 2;
  }
  box(L - 1.2, 0.3, Wd - 0.5, new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 }), 0, clr - 0.05, 0, g);
  return g;
}
