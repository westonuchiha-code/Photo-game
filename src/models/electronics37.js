// Retro electronics (queue item 37, photos/electronics/). Brand names and model names made up.
//   makePortableTV()  70s portable TV / FM-AM radio / cassette unit (portable-tv-radio-jackal.jpg), 31 x 47 x 13 cm:
//   the whole face is the photo, straightened (round CRT, contrast + channel knobs, VHF/UHF and FM/AM tuning
//   dials, volume + tone sliders, AFC switch, level meter, speaker slot, jacks); the maker's logo and model name
//   painted out and a made-up "SOLARA" / "VIXEN 300" lettered on. 3D: carry handle across the top front, five
//   lever switches on top (red, three black, blue tip), knurled tuning knobs on the right side, folded
//   telescopic antenna, dark textured plastic case, rubber feet. Origin at the base centre, face toward +z.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name, rep) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function box(w, h, d, mat, x, y, z, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; }
function cyl(r, h, mat, parent, segs = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segs), mat); m.castShadow = true; parent.add(m); return m; }

export function makePortableTV() {
  const g = new THREE.Group(); g.name = 'portable_tv';
  const W = 0.31, FH = W * 1350 / 1024, TOP = 0.055, H = FH + TOP + 0.012, D = 0.13;
  const st = tex('tv_side', true); st.repeat.set(2, 2);
  const caseM = new THREE.MeshStandardMaterial({ map: st, color: '#8a8682', roughness: 0.75, metalness: 0.15 });
  const dark = new THREE.MeshStandardMaterial({ color: '#2a2928', roughness: 0.6, metalness: 0.2 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#c8ccd0', roughness: 0.2, metalness: 0.9 });
  // case: slightly rounded box; face set 4 mm proud of it
  const sh = new THREE.Shape(); const r = 0.012;
  sh.moveTo(-W / 2 + r, 0); sh.lineTo(W / 2 - r, 0); sh.quadraticCurveTo(W / 2, 0, W / 2, r); sh.lineTo(W / 2, H - r); sh.quadraticCurveTo(W / 2, H, W / 2 - r, H);
  sh.lineTo(-W / 2 + r, H); sh.quadraticCurveTo(-W / 2, H, -W / 2, H - r); sh.lineTo(-W / 2, r); sh.quadraticCurveTo(-W / 2, 0, -W / 2 + r, 0);
  const cg = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 }); cg.translate(0, 0, -D / 2);
  const body = new THREE.Mesh(cg, caseM); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // the photo face, with the made-up names lettered over the painted-out spots
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1350; const x = c.getContext('2d');
  const ft = new THREE.CanvasTexture(c); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 8;
  const img = new Image();
  img.onload = () => {
    x.drawImage(img, 0, 0);
    x.fillStyle = '#d8dadc'; fitText(x, 'SOLARA', 450, 262, 170, 40, F.wayfind, { spacing: 10 });
    x.save(); x.translate(812, 690); x.transform(1, 0, -0.25, 1, 0, 0); x.fillStyle = '#f2f2ee'; fitText(x, 'VIXEN', 0, 0, 130, 50, F.heavy, { spacing: 2 }); x.restore();
    x.fillStyle = '#f2f2ee'; fitText(x, '300', 925, 696, 52, 32, F.wayfind);
    ft.needsUpdate = true;
  };
  img.src = 'assets/textures/tv_front.png';
  const face = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.004, FH), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.55, metalness: 0.1 }));
  face.position.set(0, 0.006 + FH / 2, D / 2 + 0.0045); g.add(face);
  // the CRT glass bulges slightly out of its bezel
  const crt = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, 0.5), new THREE.MeshStandardMaterial({ color: '#141618', roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.5 }));
  crt.rotation.x = Math.PI / 2; const cr = 0.255 * W; crt.scale.set(cr / Math.sin(0.5), 0.02 / (1 - Math.cos(0.5)), cr / Math.sin(0.5));
  crt.position.set(-0.035 * W, 0.006 + FH * (1 - 0.395), D / 2 + 0.004 - 0.02 * Math.cos(0.5) / (1 - Math.cos(0.5))); g.add(crt);
  // top strip: five lever switches standing in slots, carry handle across the front
  const ty = H + 0.004;
  [['#c0281e', -0.11], ['#222', -0.055], ['#222', 0], ['#222', 0.055], ['#1a1a1a', 0.11]].forEach(([col, px], i) => {
    box(0.02, 0.004, 0.05, new THREE.MeshStandardMaterial({ color: '#0e0e0e' }), px, ty - 0.002, 0.02, g);
    const lever = new THREE.Group(); lever.position.set(px, ty, 0.03); lever.rotation.x = 0.25; g.add(lever);
    const stalk = cyl(0.006, 0.045, dark, lever, 10); stalk.position.y = 0.022;
    const cap = cyl(0.013, 0.03, new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 }), lever, 18); cap.position.y = 0.055;
    if (i === 4) { const tip = cyl(0.009, 0.004, new THREE.MeshStandardMaterial({ color: '#2a8ad0', roughness: 0.3 }), lever, 16); tip.position.y = 0.071; }
  });
  const hm = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.5, metalness: 0.3 });
  const hp = [new THREE.Vector3(-0.14, H - 0.02, D / 2), new THREE.Vector3(-0.13, H - 0.024, D / 2 + 0.028), new THREE.Vector3(0.13, H - 0.024, D / 2 + 0.028), new THREE.Vector3(0.14, H - 0.02, D / 2)];
  const handle = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp, false, 'catmullrom', 0.2), 40, 0.009, 10), hm); handle.castShadow = true; g.add(handle);
  for (const s of [-1, 1]) { const m = box(0.03, 0.04, 0.03, hm, s * 0.14, H - 0.022, D / 2 + 0.005, g); m.rotation.z = s * 0.1; }
  // right side: knurled TV + radio tuning knobs; left side: a strap lug
  const knurl = new THREE.MeshStandardMaterial({ color: '#1c1c1c', roughness: 0.45, metalness: 0.4 });
  for (const yy of [0.006 + FH * 0.82, 0.006 + FH * 0.37]) {
    const k = cyl(0.026, 0.03, knurl, g, 24); k.rotation.z = Math.PI / 2; k.position.set(W / 2 + 0.016, yy, 0.03);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const rib = box(0.03, 0.004, 0.004, knurl, W / 2 + 0.016, yy + Math.cos(a) * 0.026, 0.03 + Math.sin(a) * 0.026, g); rib.rotation.x = a; }
    const cap = cyl(0.016, 0.004, chrome, g, 20); cap.rotation.z = Math.PI / 2; cap.position.set(W / 2 + 0.032, yy, 0.03);
  }
  box(0.012, 0.05, 0.03, hm, -W / 2 - 0.006, H - 0.06, 0, g);
  // telescopic antenna folded down the back right edge, ball tip at the top
  const ant = cyl(0.004, H - 0.03, chrome, g, 10); ant.position.set(W / 2 - 0.02, H / 2 + 0.01, -D / 2 - 0.008);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), chrome); ball.position.set(W / 2 - 0.02, H - 0.005, -D / 2 - 0.008); g.add(ball);
  const hinge = cyl(0.008, 0.02, hm, g, 12); hinge.position.set(W / 2 - 0.02, 0.03, -D / 2 - 0.008);
  // jack stubs at the bottom corners (photo shows them), rubber feet
  for (const s of [-1, 1]) { const j = cyl(0.004, 0.03, chrome, g, 8); j.rotation.z = Math.PI / 2; j.position.set(s * (W / 2 + 0.012), 0.04, D / 2 - 0.02); }
  for (const s of [-1, 1]) for (const t of [-1, 1]) { const f = cyl(0.01, 0.006, new THREE.MeshStandardMaterial({ color: '#111' }), g, 12); f.position.set(s * (W / 2 - 0.03), -0.002, t * (D / 2 - 0.025)); }
  return g;
}
