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

// ---------------------------------------------------------------------------------------------------------
//   makeScoutTruck()  dusty olive 70s two-door 4x4 (old-army-scout-truck.jpg), 4.2 m x 1.78 m x 1.68 m.
//   Front, hood and windscreen are the photo itself, straightened (grille, round headlights, amber lamps,
//   rust-bloomed bumper; dust on the glass with the wipers parked); the badge, plates and hood sticker are
//   painted out. Body sides: the fender's olive with the hood's real dust grain. A 3D brush guard, a round
//   door mirror, rusty orange steel wheels, and the front right tyre gone flat. Nose toward +x, ground y = 0.
export function makeScoutTruck() {
  const g = new THREE.Group(); g.name = 'scout_truck';
  const L = 4.2, Wd = 1.78, hw = Wd / 2, clr = 0.42, axR = 0.95, axF = 3.25, R = 0.36;
  const sh = new THREE.Shape(); sh.moveTo(0.02, clr + 0.05);
  const arch = (cx) => { sh.lineTo(cx - 0.45, clr + 0.05); sh.absarc(cx, R, 0.45, Math.PI, 0, true); };
  arch(axR); arch(axF);
  sh.lineTo(L - 0.06, clr + 0.05); sh.lineTo(L, 0.58); sh.lineTo(L, 1.0); sh.lineTo(L - 0.06, 1.06);
  sh.lineTo(L - 1.25, 1.1); sh.lineTo(L - 1.62, 1.64); sh.lineTo(0.12, 1.68); sh.lineTo(0.02, 1.6); sh.lineTo(0.02, clr + 0.05);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: Wd - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 10 });
  geo.translate(-L / 2, 0, -(Wd - 0.06) / 2);
  const pp = geo.attributes.position, puv = geo.attributes.uv;
  for (let i = 0; i < pp.count; i++) puv.setXY(i, (pp.getX(i) + pp.getZ(i) * 0.5) / 2.4, (pp.getY(i) + pp.getZ(i)) / 2.4);
  const pt = tex('st_paint', true);
  const paint = new THREE.MeshStandardMaterial({ map: pt, roughness: 0.92, metalness: 0.05 });
  const body = new THREE.Mesh(geo, paint); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const X = (s) => s - L / 2;
  // front (photo) and hood (photo)
  const front = new THREE.Mesh(new THREE.PlaneGeometry(Wd + 0.04, 0.76), new THREE.MeshStandardMaterial({ map: tex('st_front'), roughness: 0.8 }));
  front.rotation.y = Math.PI / 2; front.position.set(X(L) + 0.035, 0.68, 0); g.add(front);
  const hoodGeo = new THREE.PlaneGeometry(Wd - 0.02, 1.22); hoodGeo.rotateX(-Math.PI / 2); hoodGeo.rotateY(Math.PI / 2);
  // texture rows run back (top of the crop = cowl) to front; columns left-to-right as seen from the front (= +z to -z)
  const hood = new THREE.Mesh(hoodGeo, new THREE.MeshStandardMaterial({ map: tex('st_hood'), color: '#a9aca4', roughness: 0.9 }));
  hood.rotation.z = -Math.atan2(0.04, 1.19); hood.position.set(X(L - 0.66), 1.128, 0); g.add(hood);
  // windscreen (dusty, wipers) on the slope; side glass reusing the dusty glass
  const ws0 = new THREE.Vector2(X(L - 1.25), 1.1), ws1 = new THREE.Vector2(X(L - 1.62), 1.64);
  const glassM = new THREE.MeshStandardMaterial({ map: tex('st_glass'), roughness: 0.35, metalness: 0.1 });
  const wsm = new THREE.Mesh(new THREE.PlaneGeometry(Wd - 0.08, ws0.distanceTo(ws1)), glassM);
  wsm.rotation.order = 'ZYX'; wsm.rotation.y = Math.PI / 2; wsm.rotation.z = Math.atan2(ws0.x - ws1.x, ws1.y - ws0.y);
  wsm.position.set((ws0.x + ws1.x) / 2 + 0.035, (ws0.y + ws1.y) / 2 + 0.02, 0); g.add(wsm);
  const sideT = tex('st_glass'); sideT.repeat.set(0.5, 0.7); sideT.offset.set(0.08, 0.2);
  const sideM = new THREE.MeshStandardMaterial({ map: sideT, roughness: 0.35, color: '#8a8e90' });
  for (const z of [-1, 1]) for (const [s0, s1] of [[L - 2.32, L - 1.42], [0.35, L - 2.5]]) {
    const top = 1.6, bot = 1.16, sl = s1 > L - 1.5 ? 0.18 : 0;
    const w = new THREE.Shape([new THREE.Vector2(s0, bot), new THREE.Vector2(s1, bot), new THREE.Vector2(s1 - sl, top), new THREE.Vector2(s0, top)]);
    const wg = new THREE.ShapeGeometry(w); wg.translate(-L / 2, 0, 0);
    const p = wg.attributes.position, uv = wg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + L / 2) / 1.2, (p.getY(i) - bot) / 0.5);
    const m = new THREE.Mesh(wg, z > 0 ? sideM : sideM.clone()); if (z < 0) m.material.side = THREE.BackSide;
    m.position.z = z * (hw + 0.004); g.add(m);
  }
  // door shut lines, handles, the little side marker lamp, a rust bloom along the sills
  const dark = new THREE.MeshStandardMaterial({ color: '#2a2e2a', roughness: 0.9 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#9a9c98', roughness: 0.45, metalness: 0.6 });
  const rust = new THREE.MeshStandardMaterial({ color: '#7a4a2a', roughness: 1 });
  for (const z of [-1, 1]) {
    for (const s of [L - 1.4, L - 2.42]) box(0.012, 0.6, 0.01, dark, X(s), 0.82, z * (hw + 0.003), g);
    box(0.12, 0.025, 0.02, chrome, X(L - 2.25), 1.02, z * (hw + 0.01), g);
    box(0.05, 0.03, 0.01, new THREE.MeshStandardMaterial({ color: '#c8641e', roughness: 0.5 }), X(L - 0.35), 0.78, z * (hw + 0.004), g);
  }
  // round door mirror on a stalk (driver's side, left as you face the truck = +z)
  const mir = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 20), chrome); mir.rotation.z = Math.PI / 2; mir.rotation.y = 0.4; mir.position.set(X(L - 1.3), 1.3, hw + 0.2); g.add(mir);
  tube(new THREE.Vector3(X(L - 1.3), 1.15, hw), new THREE.Vector3(X(L - 1.3), 1.27, hw + 0.18), 0.012, chrome, g);
  // brush guard: two uprights through the bumper, a hoop round the lamps, a mid rail
  const gm = new THREE.MeshStandardMaterial({ map: pt, color: '#9aa29a', roughness: 0.85 });
  const gx = X(L) + 0.14, gr = 0.028;
  for (const z of [-0.5, 0.5]) { box(0.06, 0.82, 0.07, gm, gx, 0.73, z, g); box(0.14, 0.06, 0.07, gm, gx - 0.07, 0.4, z, g); }
  const hoop = [new THREE.Vector3(gx - 0.35, 1.06, hw - 0.04), new THREE.Vector3(gx - 0.02, 1.1, hw - 0.06), new THREE.Vector3(gx, 1.12, 0.5), new THREE.Vector3(gx, 1.12, -0.5), new THREE.Vector3(gx - 0.02, 1.1, -hw + 0.06), new THREE.Vector3(gx - 0.35, 1.06, -hw + 0.04)];
  const hm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hoop), 40, gr, 8), gm); hm.castShadow = true; g.add(hm);
  for (const z of [-1, 1]) tube(new THREE.Vector3(gx, 1.1, z * 0.5), new THREE.Vector3(gx - 0.02, 0.72, z * (hw - 0.04)), gr, gm, g);
  box(0.05, 0.05, 1.0, gm, gx, 0.86, 0, g);
  // bumper underside, tow shackles, rusty frame horns, the rear: tailgate with lamps + bumper
  box(0.14, 0.14, Wd + 0.06, new THREE.MeshStandardMaterial({ map: pt, roughness: 0.9 }), X(L) + 0.03, 0.38, 0, g);
  for (const z of [-0.62, 0.62]) { const sk = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12), rust); sk.position.set(X(L) + 0.12, 0.3, z); g.add(sk); }
  box(L - 0.4, 0.12, 1.0, rust, 0, 0.36, 0, g);
  box(0.1, 0.12, Wd + 0.04, chrome, X(0) - 0.03, 0.42, 0, g);
  for (const z of [-1, 1]) box(0.03, 0.22, 0.1, new THREE.MeshStandardMaterial({ color: '#8a1a14', roughness: 0.4, emissive: '#200000' }), X(0) - 0.02, 0.85, z * (hw - 0.1), g);
  box(0.02, 0.012, 0.8, dark, X(0) - 0.02, 1.08, 0, g);
  // wheels: rust-orange steel rims, worn tyres; the front right one is flat
  const rc = document.createElement('canvas'); rc.width = rc.height = 256; const rx = rc.getContext('2d');
  rx.fillStyle = '#1d1d1c'; rx.fillRect(0, 0, 256, 256);
  const rg = rx.createRadialGradient(128, 128, 10, 128, 128, 92); rg.addColorStop(0, '#8a5434'); rg.addColorStop(0.5, '#9a6040'); rg.addColorStop(0.85, '#6e4028'); rg.addColorStop(1, '#2a1a12');
  rx.fillStyle = rg; rx.beginPath(); rx.arc(128, 128, 92, 0, 7); rx.fill();
  rx.fillStyle = '#5a3420'; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; rx.beginPath(); rx.arc(128 + Math.cos(a) * 30, 128 + Math.sin(a) * 30, 6, 0, 7); rx.fill(); }
  rx.fillStyle = '#3a2416'; rx.beginPath(); rx.arc(128, 128, 18, 0, 7); rx.fill();
  for (let i = 0; i < 200; i++) { rx.fillStyle = `rgba(${150 + Math.random() * 60},${90 + Math.random() * 30},50,${Math.random() * 0.3})`; rx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }
  const rt = new THREE.CanvasTexture(rc); rt.colorSpace = THREE.SRGBColorSpace;
  const tyre = new THREE.MeshStandardMaterial({ color: '#1e1e1e', roughness: 0.95 }), rim = new THREE.MeshStandardMaterial({ map: rt, roughness: 0.8 });
  for (const ax of [axR, axF]) for (const z of [-1, 1]) {
    const flat = ax === axF && z < 0;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.26, 32), [tyre, rim, rim]); t.rotation.x = Math.PI / 2;
    t.position.set(X(ax), flat ? R * 0.82 : R, z * (hw - 0.14)); if (flat) { t.scale.set(1.06, 1, 0.82); t.position.y = R * 0.82; }
    t.castShadow = true; g.add(t);
  }
  return g;
}

// ---------------------------------------------------------------------------------------------------------
//   makeWorkVan()  white kei box van with an orange stripe (kei-work-van.jpg): 3.33 m x 1.475 m x 1.88 m.
//   Both sides are the photo itself, rectified to a flat elevation (doors, handles, window visors, the slide-door
//   rail, the stripe, the real steel wheels) with the shop's name painted out; a made-up outfitter ("Hataraku
//   Shokai", with a hand-drawn logo) and the generic "work clothes · work goods" line lettered back on.
//   Short nose with the headlights and a small grille, raked windscreen, upright tailgate with corner lamps.
//   Nose toward +x, ground y = 0.
export function makeWorkVan() {
  const g = new THREE.Group(); g.name = 'work_van';
  const PXM = 603, G = 1180, L = 2006 / PXM, Wd = 1.475, hw = Wd / 2, IW = 2048, IH = 1160;
  const X = (px) => L / 2 - px / PXM, Y = (py) => (G - py) / PXM;
  const R = 0.275, AR = 0.325, xF = X(200), xR = X(1656), SILL = Y(1010);
  // ---- body: lofted along its length from the photo's silhouette. Each cross-section is a rounded box;
  // the corners of the nose are rounded in plan, the upper body tucks in a little, so nothing is a flat slab.
  const TOP = [[8, 482], [32, 482], [60, 470], [85, 450], [125, 415], [165, 395], [215, 387], [280, 376], [580, 44], [640, 16], [1980, 8], [2006, 40]];
  const lerpPoly = (pts, px) => { for (let i = 1; i < pts.length; i++) if (px <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (y1 - y0) * (px - x0) / (x1 - x0); } return pts[pts.length - 1][1]; };
  const topY = (x) => Y(lerpPoly(TOP, (L / 2 - x) * PXM));
  const botY = (x) => {
    let y = SILL;
    for (const c of [xF, xR]) { const d = x - c; if (Math.abs(d) < AR) y = Math.max(y, R + Math.sqrt(AR * AR - d * d)); }
    const d = x - xF; if (d > 0.22) { const t = THREE.MathUtils.clamp((d - 0.22) / 0.08, 0, 1), arc = R + Math.sqrt(Math.max(0, AR * AR - d * d)); y = arc * (1 - t) + 0.3 * t; }
    return y;
  };
  const xN = X(8), xT = X(2006), rhoF = 0.1, rhoR = 0.05;
  const halfW = (x, y) => {
    let w = hw;
    if (x > xN - rhoF) { const d = x - (xN - rhoF); w = hw - rhoF + Math.sqrt(Math.max(0, rhoF * rhoF - d * d)); }
    if (x < xT + rhoR) { const d = (xT + rhoR) - x; w = hw - rhoR + Math.sqrt(Math.max(0, rhoR * rhoR - d * d)); }
    return w * (1 - 0.045 * THREE.MathUtils.clamp((y - 1.15) / 0.7, 0, 1));
  };
  const NS = 140, K = 6, ring = [];
  for (const [cyS, czS, a0] of [[-1, 1, -Math.PI / 2], [1, 1, 0], [1, -1, Math.PI / 2], [-1, -1, Math.PI]]) for (let k = 0; k <= K; k++) ring.push([cyS, czS, a0 + (k / K) * Math.PI / 2]);
  const M = ring.length, pos = [], uv = [], idx = [];
  const xs = []; for (let i = 0; i <= NS; i++) xs.push(xT + (xN - xT) * i / NS);
  for (const x of xs) {
    const yb = botY(x), yt = topY(x), rt = Math.min(0.09, (yt - yb) / 3), rb = 0.035;
    for (const [cyS, czS, a] of ring) {
      const r = cyS > 0 ? rt : rb, cy = cyS > 0 ? yt - rt : yb + rb;
      const y = cy + r * Math.sin(a), w = halfW(x, y), z = czS * (w - r) + r * Math.cos(a);
      pos.push(x, y, z);
      const yv = THREE.MathUtils.clamp(y, yb + 0.012, yt - 0.012);
      uv.push(Math.max(40, (L / 2 - x) * PXM) / IW, 1 - (G - yv * PXM) / IH);
    }
  }
  const groups = [[], [], [], []];                      // 0: -z side photo, 1: +z side photo, 2: roof, 3: underside
  for (let i = 0; i < NS; i++) for (let j = 0; j < M - 1; j++) {
    const a = i * M + j, b = a + M, zc = (pos[a * 3 + 2] + pos[(a + 1) * 3 + 2]) / 2, yc = (pos[a * 3 + 1] + pos[(a + 1) * 3 + 1]) / 2;
    const gi = Math.abs(zc) > 0.3 ? (zc < 0 ? 0 : 1) : (yc > 1 ? 2 : 3);
    groups[gi].push(a, b, a + 1, a + 1, b, b + 1);
  }
  // end caps (front slightly domed) with their own canvases
  for (const gi of groups) idx.push(...gi);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  let off = 0; const all = [];
  groups.forEach((gi, n) => { geo.addGroup(off, gi.length, n); off += gi.length; all.push(...gi); });
  geo.setIndex(all); geo.computeVertexNormals();
  // ---- sides: the rectified photo + made-up lettering (drawn once the photo has loaded)
  const sideTex = (farSide) => {
    const c = document.createElement('canvas'); c.width = IW; c.height = IH; const x = c.getContext('2d');
    x.fillStyle = '#eceeee'; x.fillRect(0, 0, IW, IH);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const img = new Image();
    img.onload = () => {
      x.drawImage(img, 0, 0, IW, IH);
      x.save(); if (!farSide) { x.translate(IW, 0); x.scale(-1, 1); }
      const ink = '#33200f';
      x.strokeStyle = ink; x.lineWidth = 7; x.beginPath(); x.arc(430, 704, 34, 0, 7); x.stroke();
      x.fillStyle = ink; x.fillRect(412, 684, 9, 42); x.fillRect(440, 684, 9, 42); x.fillRect(412, 700, 37, 8);
      x.beginPath(); x.moveTo(404, 690); x.lineTo(458, 674); x.lineTo(460, 684); x.lineTo(406, 698); x.fill();
      fitText(x, 'ハタラク商会', 620, 708, 300, 74, F.antique, { spacing: 6 });
      fitText(x, '作業服・作業用品', 1500, 728, 600, 58, F.antique, { spacing: 30 });
      x.restore(); t.needsUpdate = true;
    };
    img.src = 'assets/textures/kv_side.png';
    return t;
  };
  const white = new THREE.MeshStandardMaterial({ color: '#e8eaea', roughness: 0.45, metalness: 0.05 });
  const under = new THREE.MeshStandardMaterial({ color: '#202020', roughness: 0.9 });
  // nose: headlights on the shoulders, small grille, bumper with a dark lip (no plate)
  const fc = document.createElement('canvas'); fc.width = 512; fc.height = 384; const fx = fc.getContext('2d');
  fx.fillStyle = '#e8eaea'; fx.fillRect(0, 0, 512, 384);
  for (const s of [-1, 1]) {
    const cx = 256 + s * 178;
    const hg = fx.createLinearGradient(cx - 50, 0, cx + 50, 80); hg.addColorStop(0, '#f4f6f6'); hg.addColorStop(0.5, '#aab2b6'); hg.addColorStop(1, '#e8ecee');
    fx.fillStyle = '#2a2e30'; fx.beginPath(); fx.roundRect(cx - 62, 30, 124, 92, 18); fx.fill();
    fx.fillStyle = hg; fx.beginPath(); fx.roundRect(cx - 56, 36, 112, 80, 15); fx.fill();
    fx.fillStyle = '#f0a020'; fx.fillRect(cx + s * 26 - 16, 92, 32, 16);
    fx.fillStyle = '#fbfdfd'; fx.beginPath(); fx.arc(cx - s * 14, 70, 20, 0, 7); fx.fill();
  }
  fx.fillStyle = '#1c1c1c'; fx.beginPath(); fx.roundRect(150, 70, 212, 40, 10); fx.fill();
  fx.fillStyle = '#3a3a3a'; for (let i = 0; i < 4; i++) fx.fillRect(160, 77 + i * 8, 192, 2);
  fx.fillStyle = '#c4c6c8'; fx.fillRect(0, 196, 512, 5);
  fx.fillStyle = '#2a2a2a'; fx.beginPath(); fx.roundRect(110, 300, 292, 38, 8); fx.fill();
  fx.fillStyle = 'rgba(0,0,0,0.25)'; fx.fillRect(0, 360, 512, 24);
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace;
  // tailgate: big window, corner lamps, handle, bumper
  const rc = document.createElement('canvas'); rc.width = 512; rc.height = 640; const rx = rc.getContext('2d');
  rx.fillStyle = '#e8eaea'; rx.fillRect(0, 0, 512, 640);
  const rg = rx.createLinearGradient(0, 40, 0, 280); rg.addColorStop(0, '#4a4642'); rg.addColorStop(1, '#1e1c1c');
  rx.fillStyle = '#141414'; rx.beginPath(); rx.roundRect(52, 32, 408, 230, 24); rx.fill();
  rx.fillStyle = rg; rx.beginPath(); rx.roundRect(58, 38, 396, 218, 20); rx.fill();
  for (const lx of [8, 472]) { rx.fillStyle = '#b81818'; rx.fillRect(lx, 290, 32, 110); rx.fillStyle = '#e88a14'; rx.fillRect(lx, 400, 32, 36); rx.fillStyle = '#f2f2f2'; rx.fillRect(lx, 436, 32, 36); }
  rx.fillStyle = '#8a8c8e'; rx.fillRect(212, 312, 88, 14);
  rx.strokeStyle = 'rgba(0,0,0,0.3)'; rx.lineWidth = 3; rx.strokeRect(46, 20, 420, 500);
  rx.fillStyle = '#c8cacb'; rx.fillRect(0, 548, 512, 70); rx.fillStyle = '#2a2a2a'; rx.fillRect(0, 618, 512, 22);
  const rt = new THREE.CanvasTexture(rc); rt.colorSpace = THREE.SRGBColorSpace;
  const body = new THREE.Mesh(geo, [
    new THREE.MeshStandardMaterial({ map: sideTex(true), roughness: 0.42, metalness: 0.05 }),
    new THREE.MeshStandardMaterial({ map: sideTex(false), roughness: 0.42, metalness: 0.05 }),
    white, under,
  ]);
  body.castShadow = true; body.receiveShadow = true; g.add(body);
  // end faces: the exact cross-section outline as a flat shape, the canvas mapped across its full width
  for (const [i, map, dir] of [[NS, ft, 1], [0, rt, -1]]) {
    const base = i * M, cs = new THREE.Shape(); let y0 = 9, y1 = -9, zm = 0;
    for (let j = 0; j < M; j++) { const z = pos[(base + j) * 3 + 2], y = pos[(base + j) * 3 + 1]; j ? cs.lineTo(z, y) : cs.moveTo(z, y); y0 = Math.min(y0, y); y1 = Math.max(y1, y); zm = Math.max(zm, z); }
    const cg = new THREE.ShapeGeometry(cs), cp = cg.attributes.position, cu = cg.attributes.uv;
    for (let k = 0; k < cp.count; k++) cu.setXY(k, 0.5 - dir * cp.getX(k) / (2 * zm), (cp.getY(k) - y0) / (y1 - y0));
    const cap = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ map, roughness: 0.4, side: THREE.DoubleSide }));
    cap.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; cap.position.x = pos[base * 3] + dir * 0.001; g.add(cap);
  }
  // front bumper: a rounded bar wrapping the nose below the face, dark lip underneath
  {
    const bs = new THREE.Shape(); const bw = hw - 0.02, bd = 0.09, br = 0.06;
    bs.moveTo(-bw + br, 0); bs.lineTo(bw - br, 0); bs.quadraticCurveTo(bw, 0, bw, -br); bs.lineTo(bw - 0.02, -bd); bs.lineTo(-bw + 0.02, -bd); bs.lineTo(-bw, -br); bs.quadraticCurveTo(-bw, 0, -bw + br, 0);
    const bg = new THREE.ExtrudeGeometry(bs, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 8 });
    bg.applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)));
    const bm = new THREE.Mesh(bg, white); bm.position.set(xN + 0.03, 0.27, 0); bm.castShadow = true; g.add(bm);
    box(0.05, 0.03, Wd - 0.3, under, xN - 0.02, 0.29, 0, g);
  }
  // dark wheel-well liners inside the arches (the front one stops at the nose)
  for (const xc of [xF, xR]) {
    const r = AR - 0.008, a0 = Math.acos(THREE.MathUtils.clamp((xN - 0.02 - xc) / r, -1, 1)), a1 = Math.PI - Math.acos(THREE.MathUtils.clamp((xc - xT - 0.02) / r, -1, 1));
    const lp = [], li = [], N = 20, zz = hw - 0.05;
    for (let i = 0; i <= N; i++) { const t = a0 + (a1 - a0) * i / N; lp.push(xc + r * Math.cos(t), R + r * Math.sin(t), -zz, xc + r * Math.cos(t), R + r * Math.sin(t), zz); }
    for (let i = 0; i < N; i++) li.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)); lg.setIndex(li); lg.computeVertexNormals();
    g.add(new THREE.Mesh(lg, new THREE.MeshStandardMaterial({ color: '#141414', roughness: 1, side: THREE.DoubleSide })));
  }
  // ---- windscreen on the rake, wipers
  const wc = document.createElement('canvas'); wc.width = 256; wc.height = 256; const wx = wc.getContext('2d');
  const wg = wx.createLinearGradient(0, 0, 0, 256); wg.addColorStop(0, '#4c4844'); wg.addColorStop(0.7, '#25221f'); wg.addColorStop(1, '#141312');
  wx.fillStyle = wg; wx.fillRect(0, 0, 256, 256); wx.fillStyle = '#121110'; wx.fillRect(0, 218, 256, 38);
  wx.fillStyle = '#1c1a19'; wx.fillRect(118, 6, 20, 14);
  const glass = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(wc), roughness: 0.18, metalness: 0 });
  glass.map.colorSpace = THREE.SRGBColorSpace;
  const a = new THREE.Vector2(X(298), Y(362)), b = new THREE.Vector2(X(575), Y(50));
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(2 * halfW(X(430), 1.4) - 0.16, a.distanceTo(b)), glass);
  ws.rotation.order = 'ZYX'; ws.rotation.y = Math.PI / 2; ws.rotation.z = Math.atan2(a.x - b.x, b.y - a.y);
  ws.position.set((a.x + b.x) / 2 + 0.006, (a.y + b.y) / 2 + 0.005, 0); g.add(ws);
  const blk = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.6 });
  for (const z of [-0.32, 0.22]) { const w = box(0.015, 0.012, 0.5, blk, a.x + 0.03, a.y + 0.03, z, g); w.rotation.x = 0.12; }
  // ---- door mirrors (black, on short arms by the A-pillar), wheels from the photo
  for (const z of [-1, 1]) {
    const mr = box(0.05, 0.14, 0.1, blk, X(430), Y(330), z * (hw + 0.1), g); mr.rotation.y = z * 0.15;
    box(0.06, 0.03, 0.1, blk, X(420), Y(380), z * (hw + 0.04), g);
  }
  const wm = new THREE.MeshStandardMaterial({ map: tex('kv_wheel'), roughness: 0.55, transparent: true, alphaTest: 0.5 });
  const wz0 = hw - 0.105;
  const tyre = new THREE.MeshStandardMaterial({ color: '#1b1b1b', roughness: 0.9 });
  for (const xw of [xF, xR]) for (const z of [-1, 1]) {
    const wz = z * wz0;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.175, 32), tyre); t.rotation.x = Math.PI / 2; t.position.set(xw, R, wz); t.castShadow = true; g.add(t);
    const f = new THREE.Mesh(new THREE.CircleGeometry(R, 40), wm); f.position.set(xw, R, wz + z * 0.089); f.rotation.y = z > 0 ? 0 : Math.PI; g.add(f);
  }
  return g;
}

// ---------------------------------------------------------------------------------------------------------
//   makeCommuterTrain()  two-tone commuter car (commuter-train.jpg): 20 m x 2.95 m, stainless body with a red cab
//   front. The cab face is the photo itself, straightened, its reflections faded to tinted glass and every
//   real name, logo and number painted out; a made-up line ("Hibari Railway") lettered back on: destination
//   "普通 ひばり台 / HIBARIDAI", run number, the car number and a bird roundel. Raised headlight rings, the red
//   frame lip, skirt with a coupler, bogies, roof AC units and a pantograph. Nose toward +x, y = 0 at rail top.
export function makeCommuterTrain() {
  const g = new THREE.Group(); g.name = 'commuter_train';
  const L = 20, W = 2.95, hw = W / 2, yb = 0.9, yt = 3.75, rt = 0.5, rb = 0.08;
  const sec = new THREE.Shape();
  sec.moveTo(-hw + rb, yb); sec.lineTo(hw - rb, yb); sec.quadraticCurveTo(hw, yb, hw, yb + rb); sec.lineTo(hw, yt - rt);
  sec.quadraticCurveTo(hw, yt, hw - rt, yt); sec.lineTo(-hw + rt, yt); sec.quadraticCurveTo(-hw, yt, -hw, yt - rt); sec.lineTo(-hw, yb + rb); sec.quadraticCurveTo(-hw, yb, -hw + rb, yb);
  const steel = new THREE.MeshStandardMaterial({ color: '#b8bcc0', roughness: 0.38, metalness: 0.55 });
  const bg = new THREE.ExtrudeGeometry(sec, { depth: L - 0.06, bevelEnabled: false, curveSegments: 10 });
  bg.translate(0, 0, -(L - 0.06) / 2); bg.rotateY(Math.PI / 2);
  const body = new THREE.Mesh(bg, steel); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // ---- sides: stainless with doors, windows and made-up lettering, drawn per side
  const sideTex = (mirror) => {
    const S = 205, w = Math.round(L * S), h = Math.round((yt - rt - yb) * S), c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    const Y = (m) => h - (m - yb) * S, X = (m) => (mirror ? m : L - m) * S;          // m measured from the nose
    const st = x.createLinearGradient(0, 0, 0, h); st.addColorStop(0, '#c8ccd0'); st.addColorStop(0.5, '#b4b8bc'); st.addColorStop(1, '#9ea2a6');
    x.fillStyle = st; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; x.fillRect(Math.random() * w, 0, 2 + Math.random() * 6, h); }
    const rect = (m0, m1, y0, y1, col) => { x.fillStyle = col; x.fillRect(Math.min(X(m0), X(m1)), Y(y1), Math.abs(X(m1) - X(m0)), Y(y0) - Y(y1)); };
    const glass = (m0, m1, y0, y1) => { rect(m0 - 0.04, m1 + 0.04, y0 - 0.04, y1 + 0.04, '#1a1a1c'); const gg = x.createLinearGradient(0, Y(y1), 0, Y(y0)); gg.addColorStop(0, '#4a4e52'); gg.addColorStop(1, '#202224'); x.fillStyle = gg; x.fillRect(Math.min(X(m0), X(m1)), Y(y1), Math.abs(X(m1) - X(m0)), Y(y0) - Y(y1)); };
    // the red frame wrapping round from the cab front
    rect(0, 0.12, yb, yt - rt, '#c01a24');
    // small rounded cab-side window, then the red cab door with its window
    glass(0.42, 0.78, 2.15, 2.95);
    rect(1.0, 1.7, 1.0, 3.05, '#b8141e'); rect(1.08, 1.62, 1.06, 2.99, '#c8222c'); glass(1.15, 1.55, 2.2, 2.9);
    // passenger doors (stainless, red frame, tall windows) and big windows between
    const doors = [3.3, 9.3, 15.3];
    for (const d of doors) { rect(d - 0.08, d + 1.38, 0.96, 3.0, '#b0141e'); rect(d, d + 0.64, 0.98, 2.94, '#bcc0c4'); rect(d + 0.66, d + 1.3, 0.98, 2.94, '#bcc0c4'); glass(d + 0.12, d + 0.54, 1.95, 2.8); glass(d + 0.76, d + 1.18, 1.95, 2.8); rect(d + 0.64, d + 0.66, 0.98, 2.94, '#333'); }
    for (const [a, b] of [[4.9, 9.1], [10.9, 15.1], [16.9, 19.5]]) { glass(a, (a + b) / 2 - 0.06, 1.9, 2.85); glass((a + b) / 2 + 0.06, b, 1.9, 2.85); }
    glass(2.2, 3.0, 1.9, 2.85);
    // made-up lettering: line name by the cab door, car number, small roundel
    const tx = (m) => X(m);
    x.fillStyle = '#2a2c30'; fitText(x, 'HIBARI RAILWAY', tx(2.6), Y(3.25), 1.0 * S, 0.09 * S, F.wayfind, { spacing: 3 });
    x.fillStyle = '#2a2c30'; fitText(x, 'クモハ 7302', tx(19.0), Y(1.4), 0.9 * S, 0.12 * S, F.antique, { spacing: 4 });
    x.strokeStyle = '#c01a24'; x.lineWidth = 6; x.beginPath(); x.arc(tx(2.6), Y(1.5), 0.13 * S, 0, 7); x.stroke();
    x.fillStyle = '#c01a24'; x.beginPath(); x.moveTo(tx(2.6) - 0.09 * S, Y(1.5)); x.quadraticCurveTo(tx(2.6), Y(1.5) - 0.12 * S, tx(2.6) + 0.1 * S, Y(1.52)); x.quadraticCurveTo(tx(2.6), Y(1.5) - 0.04 * S, tx(2.6) - 0.09 * S, Y(1.5)); x.fill();
    // grime along the skirt
    const dg = x.createLinearGradient(0, Y(1.3), 0, h); dg.addColorStop(0, 'rgba(70,55,40,0)'); dg.addColorStop(1, 'rgba(70,55,40,0.3)'); x.fillStyle = dg; x.fillRect(0, Y(1.3), w, h - Y(1.3));
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  };
  for (const z of [-1, 1]) {
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.06, yt - rt - yb), new THREE.MeshStandardMaterial({ map: sideTex(z < 0), roughness: 0.35, metalness: 0.45 }));
    sp.position.set(0, (yt - rt + yb) / 2, z * (hw + 0.003)); if (z < 0) sp.rotation.y = Math.PI; g.add(sp);
  }
  // ---- cab front: the photo on the section shape, plus made-up lettering on an overlay
  const fg = new THREE.ShapeGeometry(sec, 10), fp = fg.attributes.position, fu = fg.attributes.uv;
  for (let i = 0; i < fp.count; i++) fu.setXY(i, 0.5 + fp.getX(i) / W, (fp.getY(i) - yb) / (yt - yb));
  const front = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ map: tex('tr_front'), roughness: 0.4 }));
  front.rotation.y = Math.PI / 2; front.position.x = L / 2 + 0.002; g.add(front);
  // back end: plain gangway end, stainless with a door
  const back = new THREE.Mesh(fg.clone(), steel); back.rotation.y = -Math.PI / 2; back.position.x = -L / 2 - 0.002; g.add(back);
  box(0.06, 2.0, 0.9, new THREE.MeshStandardMaterial({ color: '#2a2a2c', roughness: 0.7 }), -L / 2 - 0.03, 2.0, 0, g);
  {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1000; const x = c.getContext('2d');
    const U = (u) => u * 1024, V = (v) => v * 1000;
    // destination box (LED-style panel) above the door
    x.fillStyle = '#0c0d0e'; x.fillRect(U(0.37), V(0.035), U(0.22), V(0.085)); x.fillStyle = '#e9e9e2'; x.fillRect(U(0.375), V(0.04), U(0.06), V(0.075));
    x.fillStyle = '#1a1a1a'; fitText(x, '普通', U(0.405), V(0.078), U(0.05), 46, F.antique);
    x.fillStyle = '#fafaf4'; fitText(x, 'ひばり台', U(0.52), V(0.07), U(0.13), 62, F.antique, { spacing: 4 });
    fitText(x, 'HIBARIDAI', U(0.52), V(0.105), U(0.1), 16, F.wayfind, { spacing: 2 });
    x.fillStyle = '#e8ece8'; fitText(x, 'H012', U(0.17), V(0.14), U(0.11), 54, F.wayfind, { spacing: 2 });
    // door: line name, series, car number, bird roundel
    x.fillStyle = '#ffffff'; fitText(x, 'HIBARI RAILWAY', U(0.47), V(0.555), U(0.17), 22, F.wayfind, { spacing: 1 });
    fitText(x, 'Commuter Series 7300', U(0.47), V(0.585), U(0.17), 20, F.wayfind);
    fitText(x, '7302', U(0.47), V(0.635), U(0.12), 52, F.wayfind, { spacing: 2 });
    x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(U(0.47), V(0.7), 22, 0, 7); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(U(0.47) - 15, V(0.7)); x.quadraticCurveTo(U(0.47), V(0.7) - 20, U(0.47) + 16, V(0.703)); x.quadraticCurveTo(U(0.47), V(0.7) - 7, U(0.47) - 15, V(0.7)); x.fill();
    x.fillStyle = '#c01a24'; fitText(x, 'HR', U(0.13), V(0.9), U(0.06), 34, F.heavy);
    x.fillStyle = '#3a3c40'; fitText(x, 'HIBARI RAILWAY', U(0.77), V(0.95), U(0.18), 20, F.wayfind, { spacing: 2 });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const ov = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 }));
    ov.rotation.y = Math.PI / 2; ov.position.x = L / 2 + 0.004; g.add(ov);
  }
  // red frame lip round the cab face, headlight rings (lit), horn on the roof
  const red = new THREE.MeshStandardMaterial({ color: '#b8141e', roughness: 0.4, metalness: 0.2 });
  const pts = sec.getPoints(16).map((p) => new THREE.Vector3(L / 2 + 0.02, p.y, -p.x));
  const lip = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.035, 8, true), red); g.add(lip);
  const fu2 = (u) => -(u - 0.5) * W, fv = (v) => yt - v * (yt - yb);
  for (const [u, v] of [[0.09, 0.70], [0.82, 0.73]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 10, 28), new THREE.MeshStandardMaterial({ color: '#18181a', roughness: 0.5 })); ring.rotation.y = Math.PI / 2; ring.position.set(L / 2 + 0.03, fv(v), fu2(u)); g.add(ring);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.085, 24), new THREE.MeshStandardMaterial({ color: '#f0a040', emissive: '#ff9a20', emissiveIntensity: 0.9, roughness: 0.2 })); lens.rotation.y = Math.PI / 2; lens.position.set(L / 2 + 0.035, fv(v), fu2(u)); g.add(lens);
  }
  const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.14, 12), new THREE.MeshStandardMaterial({ color: '#3a3c3e', roughness: 0.6 })); horn.position.set(L / 2 - 0.5, yt + 0.06, 0.4); g.add(horn);
  // skirt (anti-climber) with lightening holes + coupler
  for (const z of [-1, 1]) {
    const sk = box(0.35, 0.5, 0.75, red, L / 2 - 0.12, 0.65, z * 0.95, g);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), new THREE.MeshBasicMaterial({ color: '#111' })); hole.rotation.y = Math.PI / 2; hole.position.set(L / 2 + 0.056, 0.68, z * 0.95); g.add(hole); void sk;
  }
  const dk = new THREE.MeshStandardMaterial({ color: '#2c2a28', roughness: 0.75, metalness: 0.3 });
  box(0.7, 0.22, 0.32, dk, L / 2 + 0.25, 0.72, 0, g); box(0.25, 0.32, 0.4, dk, L / 2 + 0.55, 0.72, 0, g);
  // underframe, equipment boxes, bogies
  box(L - 1.2, 0.35, W - 0.3, dk, 0, 0.72, 0, g);
  for (const [x0, w] of [[-3.5, 2.2], [0.5, 1.6], [3.4, 1.4]]) box(w, 0.45, W - 0.7, new THREE.MeshStandardMaterial({ color: '#3a3c3e', roughness: 0.7 }), x0, 0.5, 0, g);
  const wheel = new THREE.MeshStandardMaterial({ color: '#4a4440', roughness: 0.6, metalness: 0.5 });
  for (const bx of [-6.9, 6.9]) {
    box(2.7, 0.3, 2.2, dk, bx, 0.48, 0, g);
    for (const ax of [-1.05, 1.05]) for (const z of [-1, 1]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.13, 24), wheel); wh.rotation.x = Math.PI / 2; wh.position.set(bx + ax, 0.43, z * 0.6); g.add(wh); }
  }
  // roof: two AC units, a pantograph near the back, conduit
  const roofM = new THREE.MeshStandardMaterial({ color: '#8e9296', roughness: 0.6, metalness: 0.3 });
  for (const ax of [-4.5, 4.5]) { box(2.6, 0.35, 1.9, roofM, ax, yt + 0.12, 0, g); for (let i = 0; i < 6; i++) box(0.1, 0.02, 1.7, dk, ax - 1 + i * 0.4, yt + 0.3, 0, g); }
  const pan = new THREE.Group(); pan.position.set(-7.6, yt + 0.05, 0); g.add(pan);
  box(1.2, 0.12, 1.4, dk, 0, 0.06, 0, pan);
  const pm = new THREE.MeshStandardMaterial({ color: '#2c2c2c', roughness: 0.5, metalness: 0.5 });
  for (const z of [-0.45, 0.45]) { tube(new THREE.Vector3(-0.5, 0.12, z), new THREE.Vector3(0.15, 0.7, z * 0.6), 0.02, pm, pan); tube(new THREE.Vector3(0.15, 0.7, z * 0.6), new THREE.Vector3(-0.2, 1.25, z * 0.4), 0.018, pm, pan); }
  box(0.08, 0.04, 1.6, new THREE.MeshStandardMaterial({ color: '#7a6040', roughness: 0.6, metalness: 0.6 }), -0.2, 1.28, 0, pan);
  return g;
}

// the platform the train stands at: raised concrete slab with tan tiles, a yellow tactile strip and white edge,
// stairs down from the station side; a stretch of narrow-gauge track on ballast; two catenary masts + wire.
// Local: track along x; the platform edge faces +z; ground y = 0, platform top = PLAT_Y.
export const PLAT_Y = 1.05;
export function makeTrainPlatform(len = 26) {
  const g = new THREE.Group(); g.name = 'train_platform';
  const D = 3.0, edgeZ = 0, trackZ = 1.62;
  const tc = document.createElement('canvas'); tc.width = 256; tc.height = 256; const tx = tc.getContext('2d');
  tx.fillStyle = '#8c8478'; tx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { tx.fillStyle = ['#c9b998', '#bfae8c', '#cdbf9f', '#b8a888'][(i * 3 + j) % 4]; tx.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); }
  const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace; tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(len / 1.2, D / 1.2);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(len, D), new THREE.MeshStandardMaterial({ map: tt, roughness: 0.85 }));
  top.rotation.x = -Math.PI / 2; top.position.set(0, PLAT_Y + 0.001, edgeZ - D / 2); top.receiveShadow = true; g.add(top);
  const conc = new THREE.MeshStandardMaterial({ color: '#8a8884', roughness: 0.95 });
  box(len, PLAT_Y, D, conc, 0, PLAT_Y / 2, edgeZ - D / 2, g);
  // yellow tactile strip (raised dots) and the white edge line, a nosing overhang
  const yc = document.createElement('canvas'); yc.width = 128; yc.height = 32; const yx = yc.getContext('2d');
  yx.fillStyle = '#e8c21c'; yx.fillRect(0, 0, 128, 32); yx.fillStyle = '#f6d43a'; for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) { yx.beginPath(); yx.arc(8 + i * 16, 8 + j * 16, 4, 0, 7); yx.fill(); }
  const yt2 = new THREE.CanvasTexture(yc); yt2.colorSpace = THREE.SRGBColorSpace; yt2.wrapS = THREE.RepeatWrapping; yt2.repeat.set(len / 0.6, 1);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.4), new THREE.MeshStandardMaterial({ map: yt2, roughness: 0.6 })); strip.rotation.x = -Math.PI / 2; strip.position.set(0, PLAT_Y + 0.004, edgeZ - 1.0); g.add(strip);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.12), new THREE.MeshStandardMaterial({ color: '#f0f0ea', roughness: 0.6 })); line.rotation.x = -Math.PI / 2; line.position.set(0, PLAT_Y + 0.004, edgeZ - 0.12); g.add(line);
  box(len, 0.08, 0.2, new THREE.MeshStandardMaterial({ color: '#b4b0a8', roughness: 0.8 }), 0, PLAT_Y - 0.04, edgeZ + 0.02, g);
  // car-stop markers (red squares on the floor, like the photo) with made-up numbers
  for (const xm of [-6, 0, 6]) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#c8202a'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#fff'; fitText(x, '2–4', 64, 34, 110, 40, F.wayfind);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); m.rotation.x = -Math.PI / 2; m.position.set(xm, PLAT_Y + 0.005, edgeZ - 0.45); g.add(m);
  }
  // stairs down to the station side
  const steps = 7, sw = 3.0, rise = PLAT_Y / steps, run = 0.3;
  for (let i = 0; i < steps; i++) box(sw, rise * (i + 1), run, conc, 0, rise * (i + 1) / 2, edgeZ - D - (steps - i) * run + run / 2, g);
  for (const sx of [-1, 1]) tube(new THREE.Vector3(sx * (sw / 2 + 0.02), 0.9, edgeZ - D - steps * run), new THREE.Vector3(sx * (sw / 2 + 0.02), PLAT_Y + 0.9, edgeZ - D), 0.025, new THREE.MeshStandardMaterial({ color: '#c8ccd0', metalness: 0.6, roughness: 0.3 }), g);
  // track: ballast bed, sleepers, rails (1067 mm gauge)
  const ball = document.createElement('canvas'); ball.width = ball.height = 256; const bx = ball.getContext('2d');
  bx.fillStyle = '#5e5650'; bx.fillRect(0, 0, 256, 256); for (let i = 0; i < 2600; i++) { const v = 60 + Math.random() * 90; bx.fillStyle = `rgb(${v + 20},${v + 8},${v})`; bx.beginPath(); bx.arc(Math.random() * 256, Math.random() * 256, 1.5 + Math.random() * 3, 0, 7); bx.fill(); }
  const bt = new THREE.CanvasTexture(ball); bt.colorSpace = THREE.SRGBColorSpace; bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(len / 2, 2);
  box(len, 0.12, 3.2, new THREE.MeshStandardMaterial({ map: bt, roughness: 1 }), 0, 0.06, trackZ, g);
  const sl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.06, 2.0), new THREE.MeshStandardMaterial({ color: '#7a7670', roughness: 0.9 }), Math.floor(len / 0.6));
  const m4 = new THREE.Matrix4(); for (let i = 0; i < sl.count; i++) { m4.makeTranslation(-len / 2 + 0.3 + i * 0.6, 0.15, trackZ); sl.setMatrixAt(i, m4); } g.add(sl);
  const railM = new THREE.MeshStandardMaterial({ color: '#7a6a5a', roughness: 0.5, metalness: 0.7 });
  for (const z of [-0.535, 0.535]) { box(len, 0.03, 0.12, railM, 0, 0.195, trackZ + z, g); box(len, 0.12, 0.07, railM, 0, 0.25, trackZ + z, g).material = new THREE.MeshStandardMaterial({ color: '#a8a6a2', roughness: 0.3, metalness: 0.9 }); }
  // catenary: masts on the far side, cantilever arms, contact wire
  const mast = new THREE.MeshStandardMaterial({ color: '#8a8c8e', roughness: 0.6, metalness: 0.4 });
  for (const xm of [-len / 2 + 2, len / 2 - 2]) {
    box(0.3, 6.2, 0.3, mast, xm, 3.1, trackZ + 2.3, g);
    tube(new THREE.Vector3(xm, 5.6, trackZ + 2.2), new THREE.Vector3(xm, 5.6, trackZ - 0.3), 0.04, mast, g);
    tube(new THREE.Vector3(xm, 6.0, trackZ + 2.2), new THREE.Vector3(xm, 5.6, trackZ - 0.1), 0.03, mast, g);
  }
  const wire = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.5 });
  tube(new THREE.Vector3(-len / 2, 5.25, trackZ), new THREE.Vector3(len / 2, 5.25, trackZ), 0.008, wire, g);
  tube(new THREE.Vector3(-len / 2, 5.6, trackZ), new THREE.Vector3(len / 2, 5.6, trackZ), 0.01, wire, g);
  // a low wall behind the track
  box(len, 1.2, 0.2, new THREE.MeshStandardMaterial({ color: '#a8a49c', roughness: 0.9 }), 0, 0.6, trackZ + 2.8, g);
  g.userData.trackZ = trackZ; g.userData.D = D; g.userData.stairs = { x0: -sw / 2, x1: sw / 2, z0: edgeZ - D - steps * run, z1: edgeZ - D };
  return g;
}

// ---------------------------------------------------------------------------------------------------------
//   Scooters (orange-scooter-rusty-scooter.jpg). Paint is sampled straight from the photo.
//   makeVintageScooter()  orange 70s step-through: convex leg shield with a slotted horn cover and amber
//     indicators, round headlight in the handlebar casting, round mirror on a stalk, front fender with a
//     chrome crest, ribbed floorboard runners, two bulging side cowls edged in black piping, black seat
//     with a chrome grab rail, split-rim wheels. Made-up badges ("Zefira", "ATELIER").
//   makeRustedScooter()  the stripped white 50s scooter next to it: leg shield and front fender bloomed
//     with rust, torn edges, no seat or cowls, the bare scaly rust tank box on the frame, bent bars,
//     flat rear tyre. Front toward +x, ground y = 0.
function scooterWheel(g, x, r, rimCol, tyreFlat = false) {
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(r - 0.035, 0.045, 12, 32), new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 }));
  tyre.position.set(x, r, 0); if (tyreFlat) { tyre.scale.set(1.04, 0.92, 1.15); tyre.position.y = r * 0.92; } g.add(tyre);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.06, r - 0.06, 0.07, 24), new THREE.MeshStandardMaterial({ color: rimCol, roughness: 0.4, metalness: 0.6 }));
  rim.rotation.x = Math.PI / 2; rim.position.copy(tyre.position); g.add(rim);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 16), new THREE.MeshStandardMaterial({ color: '#888c90', roughness: 0.4, metalness: 0.7 }));
  hub.rotation.x = Math.PI / 2; hub.position.copy(tyre.position); g.add(hub);
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; const n = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), hub.material); n.position.set(x + Math.cos(a) * 0.075, tyre.position.y + Math.sin(a) * 0.075, 0.037); g.add(n); }
}
// a body panel shell: half an ellipsoid (open side inward), used for cowls and fenders
function shell(rx, ry, rz, mat, phiLen = Math.PI) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16, 0, phiLen), mat); m.scale.set(rx, ry, rz); m.castShadow = true; return m;
}
function legShield(mat) {
  // convex in plan, narrower at the top: a lofted strip of arcs from y 0.27 to 0.95
  const pos = [], uv = [], idx = [], NY = 14, NA = 20;
  for (let i = 0; i <= NY; i++) {
    const t = i / NY, y = 0.27 + t * 0.66, e = THREE.MathUtils.smoothstep(t, 0, 0.22), hwid = (0.25 - 0.09 * t + 0.02 * Math.sin(t * Math.PI)) * (0.66 + 0.34 * e), bulge = (0.15 - 0.06 * t) * (0.25 + 0.75 * e);
    for (let j = 0; j <= NA; j++) { const u = j / NA, z = (u - 0.5) * 2 * hwid, xx = bulge * (1 - ((u - 0.5) * 2) ** 2) - 0.02 * t; pos.push(xx, y, z); uv.push(u * 0.5, t * 0.7); }
  }
  for (let i = 0; i < NY; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = true;
  // the rubber edging round the sides and top (same surface function)
  const P = (t, u) => { const y = 0.27 + t * 0.66, e = THREE.MathUtils.smoothstep(t, 0, 0.22), hwid = (0.25 - 0.09 * t + 0.02 * Math.sin(t * Math.PI)) * (0.66 + 0.34 * e), bulge = (0.15 - 0.06 * t) * (0.25 + 0.75 * e), w = (u - 0.5) * 2; return new THREE.Vector3(bulge * (1 - w * w) - 0.02 * t, y, w * hwid); };
  const edge = []; for (let i = 0; i <= 14; i++) edge.push(P(i / 14, 0)); for (let j = 1; j < 20; j++) edge.push(P(1, j / 20)); for (let i = 14; i >= 0; i--) edge.push(P(i / 14, 1));
  m.userData.edge = edge; m.userData.P = P; return m;
}
export function makeVintageScooter() {
  const g = new THREE.Group(); g.name = 'vintage_scooter';
  const ot = tex('sc_orange', true); ot.repeat.set(0.6, 0.6);
  const paint = new THREE.MeshStandardMaterial({ map: ot, roughness: 0.32, metalness: 0.05, side: THREE.DoubleSide });
  const black = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.7 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#d0d4d8', roughness: 0.15, metalness: 0.9 });
  const loft = (fn, NA, NB) => {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= NA; i++) for (let j = 0; j <= NB; j++) { const p = fn(i / NA, j / NB); pos.push(p.x, p.y, p.z); uv.push(j / NB * 0.6, i / NA * 0.8); }
    for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) { const a = i * (NB + 1) + j, b = a + NB + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, paint); m.castShadow = true; return m;
  };
  const Rw = 0.2, xF = 0.47, xR = -0.62;
  scooterWheel(g, xF, Rw, '#c8ccd0'); scooterWheel(g, xR, Rw, '#c8ccd0');

  // ---- leg shield (as in the photo): broad, slightly wider at the foot, rounded top corners, gently convex,
  // the sides wrapping back round the rider's legs, a raised spine down the middle that ends at the horn grille
  const SH = (t, u) => {
    const w = u * 2 - 1, hwid = 0.235 - 0.035 * t;
    const top = 0.63 - 0.075 * Math.pow(Math.abs(w), 6);
    const y = 0.26 + t * top;
    const spine = 0.022 * Math.exp(-((w / 0.13) ** 2)) * THREE.MathUtils.smoothstep(t, 0.12, 0.3);
    const x = 0.24 + 0.045 * (1 - w * w) + spine - 0.07 * Math.pow(Math.abs(w), 5) - 0.07 * t;
    return new THREE.Vector3(x, y, w * hwid);
  };
  g.add(loft(SH, 24, 30));
  const edge = []; for (let i = 0; i <= 24; i++) edge.push(SH(i / 24, 0)); for (let j = 1; j < 30; j++) edge.push(SH(1, j / 30)); for (let i = 24; i >= 0; i--) edge.push(SH(i / 24, 1));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge), 160, 0.008, 6), black));
  const onSH = (t, u, out = 0.004) => SH(t, u).add(new THREE.Vector3(out, 0, 0));
  // horn grille at the foot of the spine, with a small blue roundel
  const hc = document.createElement('canvas'); hc.width = 128; hc.height = 96; const hx = hc.getContext('2d');
  hx.fillStyle = '#e07a2c'; hx.fillRect(0, 0, 128, 96); hx.fillStyle = '#7a3a10'; for (let i = 0; i < 7; i++) hx.fillRect(8, 8 + i * 11, 70, 5);
  hx.fillStyle = '#3a78c0'; hx.beginPath(); hx.arc(100, 48, 16, 0, 7); hx.fill(); hx.strokeStyle = '#ddd'; hx.lineWidth = 3; hx.stroke();
  const ht = new THREE.CanvasTexture(hc); ht.colorSpace = THREE.SRGBColorSpace;
  const horn = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.07), new THREE.MeshStandardMaterial({ map: ht, roughness: 0.4 }));
  horn.rotation.y = Math.PI / 2; horn.rotation.x = 0; horn.position.copy(onSH(0.27, 0.5, 0.026)); g.add(horn);
  // indicators set into the shield's outer edges at mid height (flush amber lenses)
  for (const u of [0.02, 0.98]) {
    const p = onSH(0.42, u, 0.0); const ind = box(0.035, 0.075, 0.03, new THREE.MeshStandardMaterial({ color: '#f0a020', roughness: 0.2, emissive: '#5a3000', emissiveIntensity: 0.4 }), p.x - 0.01, p.y, p.z, g); ind.rotation.y = u < 0.5 ? 0.9 : -0.9;
  }
  // made-up badges: nameplate under the top edge, script on the left panel
  const pc = document.createElement('canvas'); pc.width = 256; pc.height = 48; const px = pc.getContext('2d');
  px.fillStyle = '#1a1a1a'; px.fillRect(0, 0, 256, 48); px.strokeStyle = '#c8ccd0'; px.lineWidth = 4; px.strokeRect(2, 2, 252, 44); px.fillStyle = '#e8eaec'; fitText(px, 'ATELIER', 128, 25, 220, 30, F.engraved, { spacing: 6 });
  const pt = new THREE.CanvasTexture(pc); pt.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.085, 0.016), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.3 })); plate.rotation.y = Math.PI / 2; plate.position.copy(onSH(0.93, 0.5, 0.004)); plate.rotation.z = 0.07; g.add(plate);
  const bc = document.createElement('canvas'); bc.width = 256; bc.height = 80; const bx2 = bc.getContext('2d');
  bx2.fillStyle = '#e8eaec'; bx2.strokeStyle = '#5a5c60'; bx2.lineWidth = 3; fitText(bx2, 'Zefira', 128, 42, 230, 64, F.script, { stroke: 1 });
  const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace;
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.034), new THREE.MeshStandardMaterial({ map: bt, transparent: true, metalness: 0.6, roughness: 0.25 }));
  badge.rotation.y = Math.PI / 2; badge.rotation.z = 0.07; badge.position.copy(onSH(0.7, 0.33, 0.006)); g.add(badge);

  // ---- handlebar casting sitting right on top of the shield: headlight nacelle in the middle, covered bars
  // tapering out to black grips, round mirror on a stalk (the photo's left side)
  const top = SH(1, 0.5), hy = top.y + 0.07, hxp = top.x - 0.02;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 16), paint); neck.position.set(hxp - 0.02, top.y + 0.03, 0); g.add(neck);
  const nac = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), paint); nac.scale.set(0.1, 0.085, 0.1); nac.position.set(hxp, hy, 0); g.add(nac);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.06, 28), paint); lamp.rotation.z = Math.PI / 2; lamp.position.set(hxp + 0.07, hy + 0.005, 0); g.add(lamp);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.066, 28), new THREE.MeshStandardMaterial({ color: '#e8eae6', roughness: 0.1, metalness: 0.3, emissive: '#303028' })); lens.rotation.y = Math.PI / 2; lens.position.set(hxp + 0.101, hy + 0.005, 0); g.add(lens);
  const bez = new THREE.Mesh(new THREE.TorusGeometry(0.069, 0.007, 8, 28), chrome); bez.rotation.y = Math.PI / 2; bez.position.set(hxp + 0.1, hy + 0.005, 0); g.add(bez);
  for (const z of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.045, 0.24, 14), paint); arm.rotation.x = Math.PI / 2; arm.position.set(hxp - 0.01, hy + 0.01, z * 0.17); g.add(arm);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.12, 12), black); grip.rotation.x = Math.PI / 2; grip.position.set(hxp - 0.01, hy + 0.012, z * 0.345); g.add(grip);
    tube(new THREE.Vector3(hxp - 0.02, hy + 0.03, z * 0.27), new THREE.Vector3(hxp - 0.06, hy + 0.04, z * 0.3), 0.005, chrome, g);   // levers
  }
  tube(new THREE.Vector3(hxp - 0.02, hy + 0.02, -0.26), new THREE.Vector3(hxp - 0.04, hy + 0.17, -0.31), 0.006, chrome, g);
  const mir = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 22), chrome); mir.rotation.z = Math.PI / 2; mir.rotation.y = 0.3; mir.position.set(hxp - 0.04, hy + 0.2, -0.315); g.add(mir);

  // ---- front fender: deep rounded helmet shape tucked straight under the shield (no fork in sight), wider
  // than the tyre, front dipping low, chrome crest strip on each side
  const FD = (t, u) => {                                                     // t: front->back over the wheel, u: across
    const a = Math.PI * (0.12 + 0.8 * t), w = u * 2 - 1;
    const r = 0.235 + 0.015 * Math.sin(Math.PI * t);
    const hwid = 0.115 - 0.02 * t, crown = Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(w), 3.2)));
    const rr = r * (0.55 + 0.45 * crown);
    return new THREE.Vector3(xF + Math.cos(a) * rr - 0.01, Rw + 0.02 + Math.sin(a) * rr * 0.92, w * hwid);
  };
  g.add(loft(FD, 26, 20));
  for (const z of [-1, 1]) {
    const pts = []; for (let i = 0; i <= 12; i++) { const p = FD(0.1 + i * 0.022, z > 0 ? 0.9 : 0.1); p.z += z * 0.004; pts.push(p); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.008, 6), chrome));
  }
  // the single-sided front link on the left, mostly hidden under the fender
  const fork = new THREE.MeshStandardMaterial({ color: '#2a2a2c', roughness: 0.5, metalness: 0.4 });
  tube(new THREE.Vector3(xF, Rw, -0.07), new THREE.Vector3(xF - 0.12, Rw + 0.05, -0.07), 0.018, fork, g);
  tube(new THREE.Vector3(xF - 0.12, Rw + 0.05, -0.07), new THREE.Vector3(xF - 0.14, Rw + 0.2, -0.05), 0.024, fork, g);

  // ---- floorboard: orange pan, black rubber runners with aluminium strips, edge trims
  box(0.5, 0.03, 0.4, paint, -0.03, 0.26, 0, g);
  const alu = new THREE.MeshStandardMaterial({ color: '#9a9ea2', roughness: 0.5, metalness: 0.6 });
  for (let i = -2; i <= 2; i++) { box(0.46, 0.006, 0.05, black, -0.03, 0.278, i * 0.07, g); box(0.46, 0.01, 0.008, alu, -0.03, 0.281, i * 0.07 + 0.035, g); }
  for (const z of [-1, 1]) box(0.5, 0.025, 0.014, black, -0.03, 0.27, z * 0.2, g);

  // ---- rear body: one smooth monocoque swelling out into the two side cowls and tapering to the tail
  const X0 = -0.24, X1 = -0.98;
  const RB = (t, v) => {
    const x = X0 + (X1 - X0) * t;
    const hw = (0.15 + 0.16 * Math.pow(Math.sin(Math.PI * Math.min(1, t / 0.92)), 0.7)) * (1 - 0.6 * THREE.MathUtils.smoothstep(t, 0.9, 1));
    const yb = 0.25 + 0.15 * t * t, yt = 0.58 + 0.13 * Math.sin(Math.PI * Math.min(1, t * 1.05)) + 0.02 * t;
    const yc = (yb + yt) / 2, ry = (yt - yb) / 2, a = v * Math.PI * 2, n = 2.8;
    const c = Math.cos(a), s = Math.sin(a);
    return new THREE.Vector3(x, yc + ry * Math.sign(s) * Math.pow(Math.abs(s), 2 / n), hw * Math.sign(c) * Math.pow(Math.abs(c), 2 / n));
  };
  g.add(loft(RB, 30, 40));
  // front + tail caps
  for (const t of [0, 1]) { const cs = new THREE.Shape(); for (let j = 0; j <= 40; j++) { const p = RB(t, j / 40); j ? cs.lineTo(p.z, p.y) : cs.moveTo(p.z, p.y); } const cap = new THREE.Mesh(new THREE.ShapeGeometry(cs), paint); cap.rotation.y = t ? -Math.PI / 2 : Math.PI / 2; cap.position.x = RB(t, 0).x; g.add(cap); }
  // cowl outlines (black piping) on each side, lying on the surface
  for (const z of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const a = i / 48 * Math.PI * 2, t = 0.47 + 0.36 * Math.cos(a), yy = 0.47 + 0.14 * Math.sin(a);
      let best = null; for (let k = 0; k <= 80; k++) { const p = RB(t, (z > 0 ? -0.25 : 0.25) + k / 160 * (z > 0 ? 1 : -1)); if (!best || Math.abs(p.y - yy) < Math.abs(best.y - yy)) best = p; }
      best.z += z * 0.004; pts.push(best);
    }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 120, 0.007, 6, true), black));
  }
  // seat on top, chrome grab rail round the back, tail lamp, side stand
  const sg = new THREE.Shape(); sg.moveTo(-0.3, 0); sg.lineTo(0.28, 0); sg.quadraticCurveTo(0.33, 0, 0.3, 0.07); sg.quadraticCurveTo(0.1, 0.1, -0.3, 0.09); sg.quadraticCurveTo(-0.36, 0.05, -0.3, 0);
  const seatG = new THREE.ExtrudeGeometry(sg, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4 }); seatG.translate(0, 0, -0.11);
  const seat = new THREE.Mesh(seatG, new THREE.MeshStandardMaterial({ color: '#1d1e22', roughness: 0.55 })); seat.position.set(-0.55, 0.7, 0); seat.castShadow = true; g.add(seat);
  const rail = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI; rail.push(new THREE.Vector3(-0.85 - Math.sin(a) * 0.1, 0.75, Math.cos(a) * 0.15)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail), 30, 0.01, 6), chrome));
  box(0.03, 0.05, 0.1, new THREE.MeshStandardMaterial({ color: '#a01818', roughness: 0.3, emissive: '#300000' }), X1 - 0.01, 0.56, 0, g);
  tube(new THREE.Vector3(-0.2, 0.25, -0.12), new THREE.Vector3(-0.28, 0, -0.2), 0.012, black, g);
  g.rotation.x = 0.06;
  return g;
}
export function makeRustedScooter() {
  const g = new THREE.Group(); g.name = 'rusted_scooter';
  // white panel paint from the photo with rust blooming over it (the rust is the photo's own rust texture)
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#d8dcde'; x.fillRect(0, 0, 512, 512);
  const tW = tex('sc_rustwhite'), tR = tex('sc_rustbox');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const draw = () => {
    if (!tW.image?.width || !tR.image?.width) return;
    x.drawImage(tW.image, 0, 0, 512, 512);
    const pat = x.createPattern(tR.image, 'repeat'); let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    // rust eats in from the edges (the texture's bottom + sides map to the panel edges), in ragged clusters
    const blob = (cx, cy, rr) => { x.beginPath(); for (let k = 0; k <= 14; k++) { const a = k / 14 * Math.PI * 2, q = rr * (0.55 + r() * 0.6); k ? x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.8) : x.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.8); } x.closePath(); x.fill(); };
    for (let i = 0; i < 70; i++) {
      const side = r(); let cx, cy;
      if (side < 0.5) { cx = r() * 512; cy = 512 - Math.pow(r(), 2) * 160; } else if (side < 0.75) { cx = Math.pow(r(), 2) * 90; cy = r() * 512; } else if (side < 0.9) { cx = 512 - Math.pow(r(), 2) * 90; cy = r() * 512; } else { cx = r() * 512; cy = r() * 400; }
      const rr = 4 + r() * (side < 0.9 ? 26 : 10);
      x.fillStyle = 'rgba(130,64,24,0.5)'; blob(cx, cy, rr * 1.4);
      x.fillStyle = pat; x.globalAlpha = 0.9; blob(cx, cy, rr); x.globalAlpha = 1;
      if (r() < 0.35) { x.strokeStyle = 'rgba(150,80,30,0.35)'; x.lineWidth = 2 + r() * 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + (r() - 0.5) * 8, cy - 20 - r() * 70); x.stroke(); }
    }
    const edge = x.createLinearGradient(0, 430, 0, 512); edge.addColorStop(0, 'rgba(110,50,20,0)'); edge.addColorStop(1, 'rgba(110,50,20,0.9)'); x.fillStyle = edge; x.fillRect(0, 430, 512, 82);
    t.needsUpdate = true;
  };
  for (const q of [tW, tR]) { const old = q.onUpdate; q.onUpdate = () => { old?.(); draw(); }; }
  const iv = setInterval(() => { if (tW.image?.width && tR.image?.width) { clearInterval(iv); draw(); } }, 200);
  const white = new THREE.MeshStandardMaterial({ map: t, roughness: 0.7, side: THREE.DoubleSide });
  const rustM = new THREE.MeshStandardMaterial({ map: tex('sc_rustbox', true), roughness: 0.95, side: THREE.DoubleSide });
  const black = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.8 });
  const Rw = 0.19, xF = 0.6, xR = -0.55;
  scooterWheel(g, xF, Rw, '#8a7a68'); scooterWheel(g, xR, Rw, '#6a5040', true);
  // leg shield (dented: pushed in on one side) and the big front fender, both with torn rusty edges
  const ls = legShield(white); ls.position.x = 0.22; ls.scale.set(1.2, 1, 1.08); g.add(ls);
  const lp = ls.geometry.attributes.position; for (let i = 0; i < lp.count; i++) { const z = lp.getZ(i), y = lp.getY(i); if (z > 0.05 && y < 0.6) lp.setX(i, lp.getX(i) - 0.04 * Math.sin((y - 0.27) * 9) * (z - 0.05) * 8); } ls.geometry.computeVertexNormals();
  const ff = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), white); ff.scale.set(0.26, 0.2, 0.13); ff.rotation.z = -0.25; ff.position.set(xF + 0.02, Rw + 0.06, 0); ff.castShadow = true; g.add(ff);
  // frame: floor rails, the open rust tank box on the spine, stays down to the rear wheel
  const frame = new THREE.MeshStandardMaterial({ color: '#b8b4ac', roughness: 0.8 });
  box(0.5, 0.03, 0.3, white, -0.02, 0.26, 0, g);
  for (const z of [-0.12, 0.12]) tube(new THREE.Vector3(0.22, 0.28, z), new THREE.Vector3(-0.6, 0.5, z * 0.6), 0.018, frame, g);
  const tank = new THREE.Group(); tank.position.set(-0.32, 0.6, 0); tank.rotation.z = 0.08; g.add(tank);
  box(0.4, 0.25, 0.3, rustM, 0, 0, 0, tank);
  box(0.42, 0.02, 0.32, white, 0, 0.13, 0, tank);
  for (const [px, pz] of [[-0.1, 0.06], [0.1, -0.05]]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), black); h.position.set(px, 0.135, pz); tank.add(h); }
  box(0.36, 0.12, 0.26, rustM, -0.42, -0.08, 0, tank);
  tube(new THREE.Vector3(-0.6, 0.48, 0.1), new THREE.Vector3(xR, Rw, 0.08), 0.02, rustM, g);
  // bent, rusted handlebars poking up, one white grip left
  tube(new THREE.Vector3(0.22, 0.9, 0), new THREE.Vector3(0.18, 1.0, 0), 0.025, rustM, g);
  tube(new THREE.Vector3(0.18, 1.0, 0), new THREE.Vector3(0.12, 1.06, -0.32), 0.015, rustM, g);
  tube(new THREE.Vector3(0.18, 1.0, 0), new THREE.Vector3(0.2, 0.97, 0.28), 0.015, rustM, g);
  tube(new THREE.Vector3(0.2, 0.97, 0.28), new THREE.Vector3(0.21, 0.96, 0.38), 0.02, new THREE.MeshStandardMaterial({ color: '#e0e0dc', roughness: 0.6 }), g);
  // the empty headlamp ring, hanging cable
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20), rustM); ring.rotation.y = Math.PI / 2; ring.position.set(0.31, 0.88, 0); g.add(ring);
  const cab = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.2, 1.0, 0.05), new THREE.Vector3(0.24, 0.8, 0.12), new THREE.Vector3(0.18, 0.62, 0.08)]), 20, 0.005, 5), black); g.add(cab);
  g.rotation.x = -0.05;
  return g;
}
