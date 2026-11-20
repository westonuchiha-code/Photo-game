// Peeling sticker + blue crate (queue item 39, grime/peeling-sticker-blue-crate.jpg).
//   makeTornLabel(text, colour)  a reusable torn price/stock label: the photo's own DISCONTINUED sticker
//     ('DISCONTINUED'), or a generic one (CLEARANCE, SALE, HALF PRICE...) torn with the photo's tear pattern:
//     the colour survives where the photo's pink did, white paper backing where only backing is left.
//     Size w x h metres, a flat decal facing +z.
//   makeBlueCrate({ label })  a glossy blue stacking crate (plastic from the photo): diagonal lattice side
//     windows, a solid lower band with the recessed label panel, a thick rim with hand-holds, ribbed floor.
//     0.6 x 0.3 x 0.4 m, origin at the base centre; the label (if any) sits on the long side's panel.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name, rep) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function box(w, h, d, mat, x, y, z, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }

const MASK = new Image(); MASK.src = 'assets/textures/st_tearmask.png';
const maskReady = new Promise((r) => { MASK.onload = r; MASK.onerror = r; });
export function makeTornLabel(text = 'DISCONTINUED', col = '#ff2bb8', w = 0.22) {
  const h = w * 501 / 1024;
  let map;
  if (text === 'DISCONTINUED') map = tex('st_torn');
  else {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 501; const x = c.getContext('2d');
    map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
    maskReady.then(() => {
      // colour + lettering
      const lab = document.createElement('canvas'); lab.width = 1024; lab.height = 501; const lx = lab.getContext('2d');
      lx.fillStyle = col; lx.fillRect(0, 0, 1024, 501);
      for (let i = 0; i < 3000; i++) { lx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`; lx.fillRect(Math.random() * 1024, Math.random() * 501, 2, 2); }
      lx.fillStyle = '#2a0a12'; lx.save(); lx.translate(512, 290); lx.scale(1, 1.6); fitText(lx, text, 0, 0, 940, 200, F.condensed, { spacing: 4 }); lx.restore();
      // split the photo's mask into "label left" (R) and "backing only" (G)
      const mc = document.createElement('canvas'); mc.width = 1024; mc.height = 501; const mx = mc.getContext('2d'); mx.drawImage(MASK, 0, 0, 1024, 501);
      const md = mx.getImageData(0, 0, 1024, 501).data, ld = lx.getImageData(0, 0, 1024, 501), out = x.createImageData(1024, 501);
      for (let i = 0; i < md.length; i += 4) {
        const pinkLeft = md[i] > 128, backing = md[i + 1] > 128, a = md[i + 3];
        if (pinkLeft) { out.data[i] = ld.data[i]; out.data[i + 1] = ld.data[i + 1]; out.data[i + 2] = ld.data[i + 2]; }
        else { const n = 225 + Math.random() * 25; out.data[i] = n; out.data[i + 1] = n - 4; out.data[i + 2] = n + 4; }
        out.data[i + 3] = (pinkLeft || backing) ? a : 0;
      }
      x.putImageData(out, 0, 0); map.needsUpdate = true;
    });
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, transparent: true, alphaTest: 0.3, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.name = 'torn_label';
  return m;
}

let _lattice = null;
function latticeAlpha() {
  if (_lattice) return _lattice;
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 512, 256);
  // diagonal lattice windows in the upper part (like the photo), a solid lower band
  x.fillStyle = '#000';
  const top = 26, bot = 150, cell = 64;
  for (let i = -2; i < 10; i++) {
    for (const d of [0, 1]) {
      x.beginPath();
      const ox = i * cell + d * cell / 2, oy = d ? (top + bot) / 2 : top;
      x.moveTo(ox + 8, top + 6); x.lineTo(ox + cell - 8, top + 6); x.lineTo(ox + cell / 2, (top + bot) / 2 - 6); x.closePath();
      if (!d) x.fill();
      x.beginPath(); x.moveTo(ox + cell / 2 + 8 - cell / 2, bot - 6); x.lineTo(ox + cell / 2 + cell / 2 - 8, bot - 6); x.lineTo(ox + cell / 2, (top + bot) / 2 + 6); x.closePath(); if (!d) x.fill();
      void oy;
    }
  }
  _lattice = new THREE.CanvasTexture(c); return _lattice;
}
export function makeBlueCrate({ label = 'DISCONTINUED', labelCol = '#ff2bb8', seed = 1 } = {}) {
  const g = new THREE.Group(); g.name = 'blue_crate';
  const W = 0.6, H = 0.3, D = 0.4, t = 0.012;
  const bt = tex('crate_blue', true); bt.repeat.set(2, 1);
  const plastic = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.28, metalness: 0.0, alphaMap: latticeAlpha(), alphaTest: 0.5, side: THREE.DoubleSide });
  const solid = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.28 });
  for (const [w, x, z, ry] of [[W, 0, D / 2, 0], [W, 0, -D / 2, Math.PI], [D, W / 2, 0, Math.PI / 2], [D, -W / 2, 0, -Math.PI / 2]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, H), plastic); p.position.set(x, H / 2, z); p.rotation.y = ry; p.castShadow = true; g.add(p);
    // wall thickness: inner skin slightly in
    const q = p.clone(); q.position.set(x * (1 - 2 * t / W), H / 2, z * (1 - 2 * t / D)); g.add(q);
  }
  // thick top rim with hand-hold slots on the short ends, bottom rim, ribbed floor
  for (const [w, d, x, z] of [[W + 0.01, 0.03, 0, D / 2 - 0.01], [W + 0.01, 0.03, 0, -D / 2 + 0.01], [0.03, D, W / 2 - 0.01, 0], [0.03, D, -W / 2 + 0.01, 0]]) { box(w, 0.035, d, solid, x, H - 0.0175, z, g); box(w, 0.02, d, solid, x, 0.01, z, g); }
  for (const sx of [-1, 1]) { const hh = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.08, 4, 8), new THREE.MeshBasicMaterial({ color: '#0a0a14' })); hh.rotation.z = Math.PI / 2; hh.rotation.y = Math.PI / 2; hh.position.set(sx * (W / 2 + 0.006), H - 0.05, 0); g.add(hh); }
  box(W - 0.02, 0.01, D - 0.02, solid, 0, 0.015, 0, g);
  for (let i = -3; i <= 3; i++) box(W - 0.04, 0.012, 0.012, solid, 0, 0.025, i * 0.05, g);
  // recessed label panel on both long sides (a slightly darker rounded inset), and the label on the front
  for (const sz of [-1, 1]) {
    const pnl = box(W * 0.62, 0.07, 0.004, new THREE.MeshStandardMaterial({ map: bt, color: '#c8c8d8', roughness: 0.3 }), 0, 0.075, sz * (D / 2 + 0.002), g); pnl.castShadow = false;
  }
  if (label) { const l = makeTornLabel(label, labelCol, 0.3); l.position.set(0.01, 0.09, D / 2 + 0.0045); l.rotation.z = (seed % 3 - 1) * 0.04; g.add(l); }
  return g;
}
