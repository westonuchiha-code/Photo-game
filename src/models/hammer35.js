// Claw hammer (queue item 35, photos/tools/). Made-up brand "IRONCLAD" on the handle label; "16 OZ" stamp.
//   makeClawHammer()  33 cm: a forged steel head (side profile extruded, bevelled): a round striking face
//   (the photo's face, worn with paint chips), a ringed neck, the eye block with the handle wedged in, a
//   curved claw split into two tines; ground-bright cheeks with a dark forging line; a wooden handle that
//   swells toward the butt, oval in section, wood straight from the photo (grime + dark grip spots), a
//   peeling red label. Lies on its side: head at +x, handle toward -z... origin at the handle butt centre,
//   the handle runs along +y, the face points +x.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
export function makeClawHammer() {
  const g = new THREE.Group(); g.name = 'claw_hammer';
  const steel = new THREE.MeshStandardMaterial({ color: '#d8dce0', metalness: 0.45, roughness: 0.3, emissive: '#3a3c40', emissiveIntensity: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: '#8a8e92', metalness: 0.45, roughness: 0.45, emissive: '#1a1c1e', emissiveIntensity: 0.4 });
  // ---- handle: lathe-like loft along y with an oval section (wider front-to-back), swelling at the butt
  const L = 0.3, segs = 40, rings = 80, pos = [], uv = [], idx = [];
  const halfW = (t) => 0.0115 + 0.0035 * Math.sin(Math.min(1, t / 0.25) * Math.PI / 2) * (1 - t) * 1.6 - 0.002 * t;   // across (x)
  const halfD = (t) => halfW(t) * 1.3;                                                                                   // front-back (z)
  for (let i = 0; i <= rings; i++) {
    const t = i / rings, y = t * L;
    for (let j = 0; j <= segs; j++) { const a = (j / segs) * Math.PI * 2; pos.push(Math.cos(a) * halfW(t), y, Math.sin(a) * halfD(t)); uv.push(j / segs, t); }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) { const a = i * (segs + 1) + j, b = a + segs + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); hg.setIndex(idx); hg.computeVertexNormals();
  const wood = _L.load('assets/textures/hm_handle.png'); wood.colorSpace = THREE.SRGBColorSpace; wood.anisotropy = 8;
  const handle = new THREE.Mesh(hg, new THREE.MeshStandardMaterial({ map: wood, roughness: 0.6 })); handle.castShadow = true; g.add(handle);
  const butt = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ color: '#7a5a34', roughness: 0.8 })); butt.rotation.x = Math.PI / 2; butt.scale.set(halfW(0), halfD(0), 1); g.add(butt);
  // red label, peeling at one corner (made-up brand)
  const lc = document.createElement('canvas'); lc.width = 128; lc.height = 512; const x = lc.getContext('2d');
  x.fillStyle = '#c81e28'; x.fillRect(0, 0, 128, 512); x.save(); x.translate(64, 256); x.rotate(-Math.PI / 2);
  x.fillStyle = '#ffffff'; fitText(x, 'IRONCLAD', 0, -6, 380, 64, F.heavy, { spacing: 6 }); x.fillStyle = '#f2c0c0'; fitText(x, 'FORGED STEEL', 0, 40, 300, 24, F.label, { spacing: 3 }); x.restore();
  x.clearRect(0, 470, 50, 42); x.fillStyle = '#e8d8c0'; x.fillRect(0, 466, 50, 4);
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`; x.fillRect(Math.random() * 128, Math.random() * 512, 2, 6); }
  const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
  const labGeo = new THREE.CylinderGeometry(1, 1, 0.075, 24, 1, true, Math.PI * 0.25, Math.PI * 0.5);
  const lab = new THREE.Mesh(labGeo, new THREE.MeshStandardMaterial({ map: lt, transparent: true, alphaTest: 0.4, roughness: 0.4 }));
  lab.scale.set(halfW(0.55) + 0.0004, 1, halfD(0.55) + 0.0004); lab.position.y = 0.55 * L; lab.rotation.y = -Math.PI / 4; g.add(lab);
  // ---- head: the outline traced from the side photo (assets/textures/hm_side.json), extruded 26 mm, with the photo
  // itself on both cheeks (grime, scratches, dull ground finish) and dirty dark steel on the narrow edges
  const SJ = { w: 1289, h: 602, pts: [[36, 468], [90, 405], [150, 335], [220, 265], [300, 190], [380, 128], [460, 85], [540, 55], [620, 40], [720, 34], [800, 32], [842, 42], [868, 70], [896, 108], [930, 122], [980, 112], [1040, 86], [1100, 70], [1170, 66], [1232, 70], [1252, 92], [1258, 160], [1258, 250], [1252, 318], [1232, 340], [1170, 345], [1110, 332], [1040, 300], [960, 280], [905, 290], [880, 312], [850, 340], [822, 410], [808, 470], [800, 494], [540, 494], [530, 470], [522, 330], [515, 255], [500, 225], [470, 212], [420, 214], [360, 232], [290, 268], [220, 318], [150, 382], [95, 450], [52, 520], [40, 538], [32, 520]] };
  const PX = 1 / 1226 * 0.17, CX = 670, EYE = 494;                       // 17 cm head; handle centre + eye bottom in the photo
  const X = (px) => (px - CX) * PX, Y = (py) => (EYE - py) * PX;
  const shape = new THREE.Shape(); SJ.pts.forEach(([px, py], i) => (i ? shape.lineTo(X(px), Y(py)) : shape.moveTo(X(px), Y(py))));
  const T = 0.026;
  const headGeo = new THREE.ExtrudeGeometry(shape, { depth: T - 0.002, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.0008, bevelSegments: 2 });
  headGeo.translate(0, 0, -(T - 0.002) / 2);
  const side = _L.load('assets/textures/hm_side.png'); side.colorSpace = THREE.SRGBColorSpace; side.anisotropy = 8;
  side.repeat.set(1 / (PX * SJ.w), 1 / (PX * SJ.h)); side.offset.set(CX / SJ.w, (SJ.h - EYE) / SJ.h);
  const cheek = new THREE.MeshStandardMaterial({ map: side, roughness: 0.7, metalness: 0.05 });
  const edge = new THREE.MeshStandardMaterial({ color: '#56585a', roughness: 0.75, metalness: 0.25 });
  const HB = L - 0.035;                                                  // eye bottom height (handle runs up inside)
  const head = new THREE.Mesh(headGeo, [cheek, edge]); head.position.y = HB; head.castShadow = true; g.add(head);
  // striking face: the face-on photo (paint chips) on the end of the poll
  const ft = _L.load('assets/textures/hm_face.png'); ft.colorSpace = THREE.SRGBColorSpace;
  const fr = 0.0142, fy = Y((66 + 345) / 2);
  const face = new THREE.Mesh(new THREE.CircleGeometry(fr * 0.97, 40), new THREE.MeshStandardMaterial({ map: ft, transparent: true, roughness: 0.75 }));
  face.rotation.y = Math.PI / 2; face.position.set(X(1258) + 0.0012, HB + fy, 0); face.scale.set(1, 1, 1); g.add(face);
  // the poll is round: a dark collar so the flat extrusion reads as a cylinder at the face end
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(fr, fr * 0.97, X(1258) - X(1185), 32, 1, true), new THREE.MeshStandardMaterial({ color: '#3e4042', roughness: 0.8, metalness: 0.2 }));
  collar.rotation.z = Math.PI / 2; collar.position.set((X(1258) + X(1185)) / 2, HB + fy, 0); g.add(collar);
  // end grain of the handle showing on top of the eye
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.011), new THREE.MeshStandardMaterial({ color: '#6a5034', roughness: 0.9 }));
  top.rotation.x = -Math.PI / 2; top.position.set(X(670), HB + Y(34) + 0.0004, 0); g.add(top);
  // "16 OZ" stamped on the far cheek (it's on that side in the photos)
  const sc = document.createElement('canvas'); sc.width = 256; sc.height = 96; const y = sc.getContext('2d');
  y.fillStyle = 'rgba(20,20,22,0.9)'; fitText(y, '16OZ', 128, 50, 190, 70, F.roman, { spacing: 4 });
  const st = new THREE.CanvasTexture(sc);
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(0.022, 0.008), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false }));
  stamp.rotation.y = Math.PI; stamp.position.set(X(700), HB + Y(150), -T / 2 - 0.0012); g.add(stamp);
  return g;
}
