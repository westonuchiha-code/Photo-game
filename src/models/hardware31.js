// Door hardware (queue item 31, photos/hardware/). All brass is one shared "worn brass" material: the
// colour sampled from the photos (deep warm gold), polished where hands touch it and dulled + darkened
// with tarnish in the recesses, plus fine circular wear scratches, so it reads like the photos up close.
//   makePrivacyKnob()   a round knob on a domed rose: tulip-profile knob (lathe), a turn-button on the
//                       face (inside) or a pin-hole (outside), two screws on the rose
//   makeThumbturn()     a deadbolt inside: domed rose with two screws and a tapered thumb-turn
//   makeToggleSwitch()  a cream toggle switch: bevelled plate, raised bat housing, the lever, two slotted screws
// All face +z, centred on the spindle, units metres.
import * as THREE from 'three';

let _brass = null;
export function wornBrass() {
  if (_brass) return _brass;
  // roughness map: circular wear arcs (bright = rough), polished centre band, darker tarnish ring at the edge
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#7a7a7a'; x.fillRect(0, 0, 512, 512);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 700; i++) {
    const cx = 256 + (r() - 0.5) * 80, cy = 256 + (r() - 0.5) * 80, rad = 20 + r() * 260, a = r() * 6.28;
    x.strokeStyle = `rgba(${r() < 0.5 ? 255 : 30},${r() < 0.5 ? 255 : 30},${r() < 0.5 ? 255 : 30},${0.12 + r() * 0.2})`;
    x.lineWidth = 0.6 + r(); x.beginPath(); x.arc(cx, cy, rad, a, a + 0.2 + r() * 0.9); x.stroke();
  }
  const g = x.createRadialGradient(256, 256, 40, 256, 256, 256); g.addColorStop(0, 'rgba(20,20,20,0.55)'); g.addColorStop(0.6, 'rgba(20,20,20,0)'); g.addColorStop(1, 'rgba(230,230,230,0.5)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  const rough = new THREE.CanvasTexture(c);
  // colour: gold with brown tarnish blotches toward the edges
  const cc = document.createElement('canvas'); cc.width = cc.height = 256; const y = cc.getContext('2d');
  y.fillStyle = '#d4a848'; y.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) { const px = r() * 256, py = r() * 256, d = Math.hypot(px - 128, py - 128) / 128; y.fillStyle = `rgba(110,75,30,${0.03 + d * d * 0.1})`; y.beginPath(); y.arc(px, py, 1 + r() * 4, 0, 7); y.fill(); }
  const col = new THREE.CanvasTexture(cc); col.colorSpace = THREE.SRGBColorSpace;
  _brass = new THREE.MeshStandardMaterial({ color: '#ffffff', map: col, metalness: 0.75, roughness: 1, roughnessMap: rough, envMapIntensity: 1 });
  // without an environment map metal reads black: lift it with a little warm emissive
  _brass.emissive = new THREE.Color('#3a2a10'); _brass.emissiveIntensity = 0.35;
  return _brass;
}
const dark = () => new THREE.MeshStandardMaterial({ color: '#2a2016', roughness: 0.8 });
const lathe = (pts, mat, seg = 40) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg), mat); m.rotation.x = Math.PI / 2; m.castShadow = true; return m; };
function screw(mat, x, y, z, ang = 0.4) {
  const g = new THREE.Group();
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat); h.rotation.x = Math.PI / 2; h.scale.set(1, 0.32, 1); g.add(h);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.0075, 0.0011, 0.0012), dark()); slot.position.z = 0.0014; slot.rotation.z = ang; g.add(slot);
  g.position.set(x, y, z); return g;
}

export function makePrivacyKnob({ side = 'inside' } = {}) {
  const g = new THREE.Group(); g.name = 'privacy_knob';
  const b = wornBrass();
  // rose: a shallow dome with a lip, 64 mm across (profile along +z after rotation)
  g.add(lathe([[0, 0.0005], [0.032, 0.0005], [0.032, 0.002], [0.03, 0.0045], [0.022, 0.0065], [0.011, 0.0075], [0, 0.0075]], b));
  g.add(screw(b, -0.022, 0.006, 0.0075, 0.3)); g.add(screw(b, 0.022, -0.006, 0.0075, 1.1));
  // knob: neck flaring into a tulip/ball shape, flat-ish face, 56 mm across
  const prof = [[0, 0.008], [0.009, 0.008], [0.0095, 0.02], [0.012, 0.03], [0.022, 0.04], [0.027, 0.052], [0.028, 0.062], [0.025, 0.07], [0.018, 0.074], [0, 0.075]];
  g.add(lathe(prof, b, 48));
  if (side === 'inside') {
    // turn-button: a small oval boss with a flat blade across it
    g.add(lathe([[0, 0.074], [0.0085, 0.074], [0.0085, 0.078], [0, 0.0785]], b, 24));
    const blade = new THREE.Mesh(new THREE.CapsuleGeometry(0.0018, 0.012, 4, 10), b); blade.rotation.z = Math.PI / 2 + 0.15; blade.scale.set(1, 1, 1.4); blade.position.z = 0.0805; g.add(blade);
    // the dark ring around the button (the gap in the photos)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0092, 0.0008, 6, 24), dark()); ring.position.z = 0.0745; g.add(ring);
  } else {
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.0018, 12), dark()); hole.position.z = 0.0752; g.add(hole);
  }
  return g;
}

export function makeThumbturn() {
  const g = new THREE.Group(); g.name = 'deadbolt_thumbturn';
  const b = wornBrass();
  g.add(lathe([[0, 0.0005], [0.033, 0.0005], [0.033, 0.003], [0.031, 0.007], [0.026, 0.009], [0, 0.0095]], b));
  const groove = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0006, 6, 40), dark()); groove.position.z = 0.0088; g.add(groove);
  g.add(screw(b, -0.019, 0, 0.0095, 0.2)); g.add(screw(b, 0.019, 0, 0.0095, 1.3));
  // thumb-turn: a tapered fin, wider at the top, on a round boss
  g.add(lathe([[0, 0.009], [0.009, 0.009], [0.009, 0.013], [0, 0.0135]], b, 24));
  const sh = new THREE.Shape(); sh.moveTo(-0.0045, -0.024); sh.lineTo(0.0045, -0.024); sh.lineTo(0.007, 0.024); sh.quadraticCurveTo(0, 0.028, -0.007, 0.024); sh.lineTo(-0.0045, -0.024);
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0009, bevelSegments: 3 }), b);
  fin.geometry.translate(0, 0, -0.002); fin.position.z = 0.016; fin.rotation.z = -0.12; fin.castShadow = true; g.add(fin);
  return g;
}

export function makeToggleSwitch() {
  const g = new THREE.Group(); g.name = 'toggle_switch';
  const cream = new THREE.MeshStandardMaterial({ color: '#ece4cc', roughness: 0.35 });
  const ivory = new THREE.MeshStandardMaterial({ color: '#f2ead4', roughness: 0.3 });
  // plate 70 x 115 mm with a bevel
  const shape = new THREE.Shape(); const W = 0.07, H = 0.115, rr = 0.004;
  shape.moveTo(-W / 2 + rr, -H / 2); shape.lineTo(W / 2 - rr, -H / 2); shape.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + rr); shape.lineTo(W / 2, H / 2 - rr); shape.quadraticCurveTo(W / 2, H / 2, W / 2 - rr, H / 2); shape.lineTo(-W / 2 + rr, H / 2); shape.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - rr); shape.lineTo(-W / 2, -H / 2 + rr); shape.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + rr, -H / 2);
  const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.002, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.003, bevelSegments: 3 }), cream);
  plate.castShadow = true; g.add(plate);
  // a little grime along the bottom edge and around the lever (finger marks)
  const gc = document.createElement('canvas'); gc.width = 64; gc.height = 128; const x = gc.getContext('2d');
  const gr = x.createRadialGradient(32, 64, 4, 32, 64, 30); gr.addColorStop(0, 'rgba(120,100,70,0.25)'); gr.addColorStop(1, 'rgba(120,100,70,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 128);
  x.fillStyle = 'rgba(110,90,60,0.18)'; x.fillRect(0, 118, 64, 10);
  const gt = new THREE.CanvasTexture(gc);
  const gm = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: gt, transparent: true, depthWrite: false })); gm.position.z = 0.0042; g.add(gm);
  // raised rectangular housing with the slot, then the lever tipped up (ON)
  const hous = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.026, 0.004), cream); hous.position.z = 0.006; g.add(hous);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.019, 0.001), new THREE.MeshStandardMaterial({ color: '#4a4232' })); slot.position.z = 0.0081; g.add(slot);
  // lever: pivots at the housing centre, tipped up (ON), with a rounded end
  const lev = new THREE.Group(); lev.position.set(0, -0.003, 0.0075); lev.rotation.x = 0.55; g.add(lev);
  const bat = new THREE.Mesh(new THREE.BoxGeometry(0.0072, 0.02, 0.0055), ivory); bat.position.y = 0.01; bat.castShadow = true; lev.add(bat);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.00275, 0.00275, 0.0072, 12), ivory); tip.rotation.z = Math.PI / 2; tip.position.y = 0.02; lev.add(tip);
  const sm = new THREE.MeshStandardMaterial({ color: '#e8e0c8', metalness: 0.2, roughness: 0.4 });
  for (const yy of [0.03, -0.03]) { const sc = screw(sm, 0, yy, 0.0043, yy > 0 ? 0.5 : -0.8); g.add(sc); }
  return g;
}
