// Inspiration 3 (queue item 68, photos/inspo3/).
//   makeArtGallery()   a small storefront gallery ("THE SPLATTER ROOM"), 14 x 10 m, front glass toward +z: soot-splattered
//                      plaster facade (photo), white interior, the user's five paintings hung as-is under track spots
//                      with small title cards, a bench, a cafe table with the curry, a wood floor
//   makeCurryPlate()   shredded chicken curry heaped in a black bowl (photo surface), two naan wedges (photo crust),
//                      chopsticks, on the painted tablecloth (photo)
//   makeChipTower()    corrugated display tower: five stacked open trays of tortilla chip bags (made-up brand), a
//                      "2 FOR $5" sign, yellow sale tags
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { makeCanvas } from './props.js';
import { makeChipBag } from './snacks43.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 24) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }

export function makeCurryPlate() {
  const g = new THREE.Group(); g.name = 'curry_plate';
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), std({ map: tex('i3_cloth', 2, 2), roughness: 0.9 })); cloth.rotation.x = -Math.PI / 2; cloth.position.y = 0.002; cloth.receiveShadow = true; g.add(cloth);
  // wide shallow black bowl (lathe), the curry heaped in it (a displaced dome with the photo's shredded surface)
  const prof = [[0, 0], [0.09, 0], [0.12, 0.012], [0.135, 0.045], [0.138, 0.05], [0.13, 0.05], [0.115, 0.02], [0.08, 0.01], [0, 0.01]].map(([a, b]) => new THREE.Vector2(a, b));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), std({ color: '#1a1c1e', roughness: 0.35, side: THREE.DoubleSide })); bowl.castShadow = true; g.add(bowl);
  const dome = new THREE.SphereGeometry(0.1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2); const p = dome.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const n = 1 + 0.08 * Math.sin(x * 120) * Math.sin(z * 110) + 0.05 * Math.sin((x + z) * 200); p.setXYZ(i, x * 1.05 * n, y * 0.4 * n, z * n); }
  dome.computeVertexNormals();
  const curry = new THREE.Mesh(dome, std({ map: tex('i3_curry', 1.5, 1.5), bumpMap: tex('i3_curry', 1.5, 1.5), bumpScale: 2, roughness: 0.45 })); curry.position.set(-0.01, 0.012, 0); g.add(curry);
  // two naan wedges leaning on the rim
  for (const [rx, ry, x, z] of [[-0.5, 0.4, 0.07, 0.03], [-0.35, 0.9, 0.06, -0.04]]) {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.15, -0.03); sh.quadraticCurveTo(0.17, 0.05, 0.12, 0.1); sh.closePath();
    const nm = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.002, bevelSegments: 2 }), std({ map: tex('i3_naan', 8, 8), roughness: 0.8 }));
    nm.rotation.set(rx, ry, 0); nm.position.set(x, 0.04, z); nm.castShadow = true; g.add(nm);
  }
  // chopsticks dipped into the curry
  for (const dz of [-0.008, 0.008]) { const c = cyl(0.003, 0.0045, 0.23, std({ color: '#e8d8b8', roughness: 0.5 }), -0.14, 0.06, dz, g, 8); c.rotation.z = Math.PI / 2 - 0.25; }
  return g;
}

export function makeChipTower() {
  const g = new THREE.Group(); g.name = 'chip_tower';
  const card = std({ color: '#f2f0ea', roughness: 0.9 }), r = rng(68);
  const front = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a8a3a'; fitText(x, 'field & farm', w / 2, 34, w - 30, 34, F.script); });
  for (let k = 0; k < 5; k++) {
    const y = k * 0.3; const t = new THREE.Group(); t.position.y = y; g.add(t);
    box(0.62, 0.02, 0.42, card, 0, 0.01, 0, t);
    for (const s of [-1, 1]) box(0.02, 0.3, 0.42, card, s * 0.31, 0.15, 0, t);
    box(0.62, 0.3, 0.02, card, 0, 0.15, -0.2, t);
    const lip = box(0.62, 0.1, 0.02, card, 0, 0.05, 0.2, t); lip.material = [card, card, card, card, std({ map: front, roughness: 0.9 }), card];
    for (let i = 0; i < 3; i++) { const b = makeChipBag(r() < 0.5 ? 'sweetpotato' : 'bluecorn', 0.17, 0.26, k * 3 + i); b.position.set(-0.19 + i * 0.19, 0.15, 0.02); b.rotation.x = -0.25; b.rotation.y = (r() - 0.5) * 0.2; t.add(b); }
  }
  // a couple of bags lying loose on top, the price sign at the foot
  for (let i = 0; i < 2; i++) { const b = makeChipBag('sweetpotato', 0.17, 0.26, 40 + i); b.rotation.set(-Math.PI / 2, 0, 0.3 + i); b.position.set(-0.1 + i * 0.2, 1.53, 0); g.add(b); }
  const sg = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, '2 FOR $5', w / 2, 66, w - 30, 74, F.heavy); });
  plane(0.34, 0.17, std({ map: sg }), 0, 0.1, 0.213, 0, g);
  const sale = canvasT(128, 160, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, 36); x.fillStyle = '#fff'; fitText(x, 'SALE', w / 2, 19, 100, 26, F.heavy); x.fillStyle = '#c81e28'; fitText(x, '$2.49', w / 2, 76, 110, 46, F.heavy); x.fillStyle = '#111'; fitText(x, 'reg $2.99', w / 2, 120, 100, 20, F.label); });
  for (const y of [0.6, 1.2]) plane(0.08, 0.1, std({ map: sale }), 0.25, y, 0.213, 0, g);
  g.userData.collider = [-0.33, 0.33, -0.22, 0.22];
  return g;
}

const ART = [['canvas_art_bluehair.png', 0.6, 0.96, 'Blue', 'marker on canvas'], ['canvas_art_eyeshroom.png', 0.95, 0.78, 'The Watcher', 'oil on canvas'], ['canvas_art_nopurple.png', 0.78, 0.97, 'NO!', 'acrylic and marker'], ['canvas_art_splash.png', 0.68, 0.98, 'Burst', 'acrylic'], ['canvas_art_collage.png', 0.65, 0.97, 'Head Full', 'mixed media'], ['canvas_art_bwsplatter.png', 0.72, 0.95, 'Static', 'acrylic'], ['canvas_art_pinkloops.png', 0.74, 0.95, 'Loops', 'acrylic'], ['canvas_art_tileface.png', 0.5, 0.67, 'Tile Face', 'marker on bathroom tile (photo)'],
  // item 72: five more
  ['canvas_art_greenmug.png', 0.64, 0.8, 'Steam', 'acrylic and marker'], ['canvas_art_pinksplatter.png', 0.69, 0.8, 'Pink Rain', 'acrylic'], ['canvas_art_drippour.png', 0.8, 0.8, 'Pour', 'poured acrylic'], ['canvas_art_bluered.png', 0.4, 0.83, 'Ember', 'acrylic'], ['canvas_art_pinkswirls.png', 0.96, 0.5, 'Petals', 'acrylic'],
  ['canvas_art_layflat.png', 0.75, 0.93, 'Please Lay Flat', 'acrylic and marker'],
  ['canvas_art_oneeye.png', 0.9, 0.68, 'One Eye', 'mixed media on canvas']];
export function makeArtGallery() {
  const g = new THREE.Group(); g.name = 'art_gallery';
  const W = 14, D = 10, X0 = -7, X1 = 7, Z0 = -5, Z1 = 5, H = 3.6;
  const white = std({ color: '#f4f2ee', roughness: 0.9 }), soot = std({ map: tex('i3_soot', W / 3, 1.6), roughness: 0.95 });
  // floor (warm wood), ceiling, walls (white inside, soot plaster outside)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: tex('wood_floor', W / 2, D / 2), roughness: 0.55 })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; floor.receiveShadow = true; g.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#2a2a2c' })); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; g.add(ceil);
  plane(W, H, white, 0, H / 2, Z0 + 0.01, 0, g); plane(D, H, white, X0 + 0.01, H / 2, 0, Math.PI / 2, g); plane(D, H, white, X1 - 0.01, H / 2, 0, -Math.PI / 2, g);
  box(W + 0.4, H + 1.4, 0.2, soot, 0, (H + 1.4) / 2, Z0 - 0.1, g); box(0.2, H + 1.4, D, soot, X0 - 0.1, (H + 1.4) / 2, 0, g); box(0.2, H + 1.4, D, soot, X1 + 0.1, (H + 1.4) / 2, 0, g);
  box(W + 0.4, 0.2, D + 0.4, std({ color: '#3a3a3c' }), 0, H + 1.5, 0, g);
  // front: soot plaster piers, glass, a black steel door frame, the name in painted letters on the fascia
  box(1.0, H + 1.4, 0.3, soot, X0 + 0.5, (H + 1.4) / 2, Z1, g); box(1.0, H + 1.4, 0.3, soot, X1 - 0.5, (H + 1.4) / 2, Z1, g);
  box(W, 1.4, 0.3, soot, 0, H + 0.7, Z1, g);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#dfe8ec', transparent: true, opacity: 0.12, roughness: 0.02, depthWrite: false, side: THREE.DoubleSide });
  plane(W - 2, H, glass, 0, H / 2, Z1, 0, g);
  const blk = std({ color: '#141416', metalness: 0.5, roughness: 0.4 });
  for (const x of [-6, -3, -1.1, 1.1, 3, 6]) box(0.06, H, 0.1, blk, x, H / 2, Z1, g);
  box(W - 2, 0.08, 0.1, blk, 0, H, Z1, g); box(2.2, 0.06, 0.1, blk, 0, 2.3, Z1, g);
  const name = canvasT(1024, 160, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#141414'; fitText(x, 'THE SPLATTER ROOM', w / 2, 70, w - 80, 96, F.marker); x.fillStyle = '#c81e28'; fitText(x, 'gallery · paintings by a local artist · free entry', w / 2, 136, w - 160, 30, F.label); });
  plane(9, 1.3, std({ map: name, transparent: true }), 0, H + 0.7, Z1 + 0.16, 0, g);
  // the paintings: back wall gets three, each side wall one; track rail with a spot on each
  const spots = [[-4.8, Z0 + 0.05, 0], [-1.6, Z0 + 0.05, 0], [1.6, Z0 + 0.05, 0], [X0 + 0.05, -1.6, Math.PI / 2], [X1 - 0.05, -1.6, -Math.PI / 2], [X0 + 0.05, 1.4, Math.PI / 2], [X1 - 0.05, 1.4, -Math.PI / 2], [4.8, Z0 + 0.05, 0],
    [-1.05, 1.885, 0], [1.05, 1.885, 0], [1.05, 1.715, Math.PI], [X0 + 0.05, 3.6, Math.PI / 2], [X1 - 0.05, 3.7, -Math.PI / 2], [-1.05, 1.715, Math.PI], [X0 + 0.05, -3.8, Math.PI / 2]];
  // a freestanding white partition in the middle of the room (item 72), with a low plinth
  box(4.4, 2.7, 0.15, white, 0, 1.35, 1.8, g);
  for (const sx of [-1.05, 1.05]) { const sp = new THREE.SpotLight('#fff1dc', 9, 6, 0.5, 0.6, 1.4); sp.position.set(sx, H - 0.25, 3.6); sp.target.position.set(sx, 1.6, 1.9); g.add(sp, sp.target); } box(4.4, 0.08, 0.17, std({ color: '#2a2a2c' }), 0, 0.04, 1.8, g);
  const rail = std({ color: '#141416', metalness: 0.6 });
  box(W - 2, 0.04, 0.04, rail, 0, H - 0.1, Z0 + 1.4, g); box(0.04, 0.04, D - 2, rail, X0 + 1.4, H - 0.1, 0, g); box(0.04, 0.04, D - 2, rail, X1 - 1.4, H - 0.1, 0, g);
  ART.forEach(([file, w0, h0, title, medium], i) => { let w = w0, h = h0;
    const [x, z, ry] = spots[i]; w *= 1.5; h *= 1.5;
    const c = makeCanvas(file, w, h, 0.035); c.position.set(x, 1.75, z); c.rotation.y = ry; g.add(c);
    const card = canvasT(256, 128, (cx, cw, ch) => { cx.fillStyle = '#fbfbf8'; cx.fillRect(0, 0, cw, ch); cx.fillStyle = '#111'; fitText(cx, title, cw / 2, 40, cw - 30, 30, F.label, { weight: 700 }); cx.fillStyle = '#555'; fitText(cx, medium, cw / 2, 80, cw - 40, 20, F.small); fitText(cx, 'not for sale', cw / 2, 108, cw - 60, 16, F.small); });
    const cardM = plane(0.14, 0.07, std({ map: card }), 0, 0, 0, ry, g); const dx = Math.cos(ry) * (w / 2 + 0.18), dz = -Math.sin(ry) * (w / 2 + 0.18); cardM.position.set(x + dx, 1.3, z + dz + (ry === 0 ? 0.005 : 0)); if (ry !== 0) cardM.position.x += Math.sign(-ry) * 0.005;
    // track spot on the rail aimed at the painting
    if (i >= 8 && i !== 10) return;   // the newer pieces facing the door share the room light below; the back of the partition gets a spot
    const nx = Math.round(Math.sin(ry)), nz = Math.round(Math.cos(ry)); const sx = x + nx * 1.35, sz = z + nz * 1.35;
    const head = cyl(0.04, 0.05, 0.14, blk, sx, H - 0.2, sz, g, 14); head.rotation.x = nz ? 0.8 : 0; head.rotation.z = nx ? -nx * 0.8 : 0;
    const sp = new THREE.SpotLight('#fff1dc', 5, 6, 0.5, 0.6, 1.6); sp.position.set(sx, H - 0.25, sz); sp.target.position.set(x, 1.75, z); g.add(sp, sp.target);
  });
  // bench, the cafe table with the curry, a fill light
  const bench = new THREE.Group(); bench.position.set(0, 0, -0.5); g.add(bench); box(2.0, 0.08, 0.5, std({ map: tex('walnut_floor', 1, 0.3), roughness: 0.5 }), 0, 0.45, 0, bench); for (const s of [-1, 1]) box(0.08, 0.45, 0.45, blk, s * 0.85, 0.225, 0, bench);
  const tbl = new THREE.Group(); tbl.position.set(4.6, 0, 3.0); g.add(tbl); cyl(0.42, 0.42, 0.03, std({ color: '#e8e4dc' }), 0, 0.75, 0, tbl, 32); cyl(0.04, 0.04, 0.75, blk, 0, 0.375, 0, tbl, 12); cyl(0.25, 0.25, 0.02, blk, 0, 0.01, 0, tbl, 24);
  const cp = makeCurryPlate(); cp.position.y = 0.766; tbl.add(cp);
  for (const s of [-1, 1]) { const ch = new THREE.Group(); ch.position.set(4.6 + s * 0.65, 0, 3.0); ch.rotation.y = s * Math.PI / 2; g.add(ch); box(0.42, 0.04, 0.42, blk, 0, 0.45, 0, ch); box(0.42, 0.45, 0.04, blk, 0, 0.7, -0.2, ch); for (const a of [-1, 1]) for (const b of [-1, 1]) box(0.03, 0.45, 0.03, blk, a * 0.18, 0.225, b * 0.18, ch); }
  const fill = new THREE.PointLight('#fff4e8', 5, 12, 1.4); fill.position.set(0, H - 0.4, 3.3); g.add(fill);
  g.userData.colliders = [[X0 - 0.2, X0 + 0.1, Z0, Z1], [X1 - 0.1, X1 + 0.2, Z0, Z1], [X0, X1, Z0 - 0.2, Z0 + 0.1], [X0, -1.1, Z1 - 0.15, Z1 + 0.15], [1.1, X1, Z1 - 0.15, Z1 + 0.15], [-1.0, 1.0, -0.75, -0.25], [3.85, 5.35, 2.4, 3.6], [-2.2, 2.2, 1.72, 1.88]];
  g.userData.areas = [{ minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: Z1 - 0.2 }, { minX: -1.05, maxX: 1.05, minZ: Z1 - 0.4, maxZ: Z1 + 0.6 }];
  return g;
}
