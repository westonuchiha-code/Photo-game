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
  // ---- head: side profile in the x-y plane (face at +x), extruded across z and centred
  const HY = L - 0.012;                 // head sits over the top of the handle
  const p = new THREE.Shape();
  p.moveTo(0.032, -0.008); p.lineTo(0.06, -0.006); p.lineTo(0.074, -0.01); p.lineTo(0.074, 0.018); p.lineTo(0.06, 0.014);       // neck to face (underside, face block)
  p.lineTo(0.034, 0.022); p.lineTo(0.018, 0.026); p.lineTo(-0.018, 0.024);                                                         // top
  p.bezierCurveTo(-0.045, 0.02, -0.07, 0.006, -0.085, -0.022);                                                                     // claw back
  p.lineTo(-0.083, -0.028); p.bezierCurveTo(-0.068, -0.006, -0.042, 0.002, -0.022, -0.002);                                     // claw tip + inside curve
  p.lineTo(-0.018, -0.018); p.lineTo(0.022, -0.018); p.lineTo(0.032, -0.008);                                                     // eye block bottom
  const headGeo = new THREE.ExtrudeGeometry(p, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.0018, bevelSize: 0.0015, bevelSegments: 3, curveSegments: 24 });
  headGeo.translate(0, 0, -0.011);
  const head = new THREE.Mesh(headGeo, [steel, dark]); head.position.y = HY; head.castShadow = true; g.add(head);
  // claw split: a dark wedge cut down the middle of the claw
  const slot = new THREE.Shape(); slot.moveTo(-0.087, -0.03); slot.bezierCurveTo(-0.07, -0.003, -0.05, 0.006, -0.03, 0.006); slot.lineTo(-0.03, 0.004); slot.bezierCurveTo(-0.05, 0.003, -0.068, -0.006, -0.08, -0.03);
  const sg = new THREE.Mesh(new THREE.ExtrudeGeometry(slot, { depth: 0.006, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: '#0e0e10' }));
  sg.position.set(0, HY, -0.003); g.add(sg);
  // round striking face (photo) on a short cylinder
  const fc = new THREE.Mesh(new THREE.CylinderGeometry(0.0145, 0.0145, 0.01, 40), dark); fc.rotation.z = Math.PI / 2; fc.position.set(0.079, HY + 0.004, 0); g.add(fc);
  const ft = _L.load('assets/textures/hm_face.png'); ft.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.0145, 40), new THREE.MeshStandardMaterial({ map: ft, transparent: true, metalness: 0.4, roughness: 0.5 }));
  face.rotation.y = Math.PI / 2; face.position.set(0.0842, HY + 0.004, 0); g.add(face);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0132, 0.0012, 8, 40), steel); ring.rotation.y = Math.PI / 2; ring.position.set(0.0745, HY + 0.004, 0); g.add(ring);
  // the handle's top wedged into the eye (end grain + metal wedge)
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.002, 0.016), new THREE.MeshStandardMaterial({ color: '#8a6a40', roughness: 0.8 })); top.position.set(0.006, HY + 0.0265, 0); g.add(top);
  const wedge = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.0022, 0.002), steel); wedge.position.set(0.006, HY + 0.0268, 0); g.add(wedge);
  // "16 OZ" stamped on both cheeks
  for (const s of [-1, 1]) {
    const sc = document.createElement('canvas'); sc.width = 256; sc.height = 96; const y = sc.getContext('2d');
    y.fillStyle = 'rgba(30,30,32,0.85)'; fitText(y, '16 OZ', 128, 50, 200, 66, F.roman, { spacing: 6 });
    const st = new THREE.CanvasTexture(sc);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.022, 0.008), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false }));
    m.position.set(-0.004, HY + 0.012, s * 0.0129); if (s < 0) m.rotation.y = Math.PI; g.add(m);
  }
  return g;
}
