// Short canned-fish tin (queue item 34, photos/food/tuna-can-pulltab). Made-up brand ("Harbor Gold").
//   makeTunaCan()  85 mm x 39 mm tin: gold-lacquered steel lid with a rolled double seam, concentric
//   stiffening rings stamped into it, a dot-printed best-by code, a pull-tab (finger ring + nose) riveted at
//   the centre; the wrap label: yellow with "LEMON PEPPER", a white band with a red brand banner, a small
//   blue sustainability badge. Origin at the base centre.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const R = 0.0425, H = 0.039;
let _gold = null;
function gold() {
  if (_gold) return _gold;
  _gold = new THREE.MeshStandardMaterial({ color: '#d6bc84', metalness: 0.6, roughness: 0.35, emissive: '#4a3a1c', emissiveIntensity: 0.6 });
  return _gold;
}

function labelTex() {
  const W = 2048, Hh = Math.round(W * H / (2 * Math.PI * R)), c = document.createElement('canvas'); c.width = W; c.height = Hh; const x = c.getContext('2d');
  x.fillStyle = '#f2b81e'; x.fillRect(0, 0, W, Hh);
  // white lower band with a red banner; thin red rule above
  const by = Hh * 0.58;
  x.fillStyle = '#fbf8f0'; x.fillRect(0, by, W, Hh - by);
  x.fillStyle = '#c8202a'; x.fillRect(0, by - 6, W, 6);
  for (const cx of [W * 0.25, W * 0.75]) {
    x.fillStyle = '#c8202a'; x.fillRect(cx - 260, by + 20, 520, Hh - by - 40);
    x.fillStyle = '#ffffff'; fitText(x, 'HARBOR GOLD', cx, by + (Hh - by) / 2 + 2, 480, (Hh - by) * 0.62, F.heavy, { spacing: 6 });
    x.fillStyle = '#ffffff'; x.fillRect(cx - 12, by + 20, 24, Hh - by - 40);      // gap in the banner (fish mark)
    x.fillStyle = '#1d3a8f'; x.beginPath(); x.ellipse(cx, by + (Hh - by) / 2, 9, 22, 0, 0, 7); x.fill();
    // flavour + sub line on the yellow
    x.fillStyle = '#ffffff'; x.strokeStyle = '#b8860b'; x.lineWidth = 4;
    fitText(x, 'LEMON PEPPER', cx, Hh * 0.22, 640, Hh * 0.3, F.heavy, { spacing: 8, stroke: 1 });
    x.fillStyle = '#c8202a'; fitText(x, 'WILD CAUGHT TUNA · IN OLIVE OIL', cx, Hh * 0.45, 560, Hh * 0.13, F.label, { spacing: 4 });
  }
  // blue sustainability badge between the two faces + net weight
  for (const cx of [W * 0.5, 0, W]) {
    x.fillStyle = '#1d5fb0'; x.beginPath(); x.roundRect(cx - 50, Hh * 0.18, 100, Hh * 0.5, 12); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 4; x.beginPath(); x.arc(cx, Hh * 0.38, 26, 0.3, 5.9); x.stroke();
    x.fillStyle = '#fff'; fitText(x, 'NET WT 5 OZ', cx, Hh * 0.6, 90, 18, F.label);
  }
  // fine vertical scuffs
  for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`; x.fillRect(Math.random() * W, 0, 1 + Math.random() * 2, Hh); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function lidTex() {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  x.fillStyle = '#c8a868'; x.fillRect(0, 0, S, S);
  // best-by code dot printed in dark ink along one side, upside-down relative to the tab like the photo
  x.save(); x.translate(S / 2, S * 0.2); x.fillStyle = 'rgba(40,30,15,0.8)'; x.font = `24px ${F.led}`; x.textAlign = 'center';
  x.fillText('BEST BY JUL 18 2027', 0, 0); x.fillText('S2 L41 0623', 0, 26); x.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function makeTunaCan() {
  const g = new THREE.Group(); g.name = 'tuna_can';
  const steel = new THREE.MeshStandardMaterial({ color: '#d4d6d8', metalness: 0.8, roughness: 0.3, emissive: '#202020', emissiveIntensity: 0.4 });
  // body wall with the label, and the gold double seams top and bottom
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H - 0.006, 64, 1, true), new THREE.MeshStandardMaterial({ map: labelTex(), roughness: 0.35, metalness: 0.1 }));
  body.position.y = H / 2; body.castShadow = true; g.add(body);
  for (const y of [0.0025, H - 0.0025]) { const seam = new THREE.Mesh(new THREE.TorusGeometry(R - 0.0004, 0.0016, 10, 64), gold()); seam.rotation.x = Math.PI / 2; seam.position.y = y; g.add(seam); }
  const bot = new THREE.Mesh(new THREE.CircleGeometry(R, 48), steel); bot.rotation.x = Math.PI / 2; bot.position.y = 0.0005; g.add(bot);
  // lid: sunk below the seam, concentric stamped rings (lathe profile with ripples), code printed on it
  const pts = [new THREE.Vector2(0, -0.0022)];
  for (let i = 1; i <= 80; i++) {
    const rr = (i / 80) * (R - 0.0025);
    let y = -0.0022;
    if (rr > 0.016 && rr < R - 0.006) y += 0.0006 * Math.sin((rr - 0.016) / 0.0072 * Math.PI) ** 2;
    if (rr > R - 0.004) y += Math.min(1, (rr - (R - 0.004)) / 0.0015) * 0.0022;     // the countersink up to the seam
    pts.push(new THREE.Vector2(rr, y));
  }
  const lidGeo = new THREE.LatheGeometry(pts, 72);
  const lp = lidGeo.attributes.position, luv = lidGeo.attributes.uv;
  for (let i = 0; i < luv.count; i++) luv.setXY(i, lp.getX(i) / (2 * R) + 0.5, lp.getZ(i) / (2 * R) + 0.5);
  const lidMat = gold().clone(); lidMat.map = lidTex();
  const lid = new THREE.Mesh(lidGeo, lidMat); lid.position.y = H - 0.0026; lid.receiveShadow = true;
  lid.material.side = THREE.DoubleSide; g.add(lid);
  // the score line around the opening
  const score = new THREE.Mesh(new THREE.TorusGeometry(R - 0.0045, 0.00035, 6, 64), new THREE.MeshStandardMaterial({ color: '#8a7040', roughness: 0.6 })); score.rotation.x = Math.PI / 2; score.position.y = H - 0.0045; g.add(score);
  // pull-tab: a teardrop ring lying flat, nose toward the rim, riveted at the centre
  const tab = new THREE.Group();
  const outer = new THREE.Shape(); outer.moveTo(0, -0.008); outer.absarc(0, 0.007, 0.0105, -Math.PI * 0.15, Math.PI * 1.15, false); outer.lineTo(0, -0.008);
  const hole = new THREE.Path(); hole.absellipse(0, 0.0085, 0.0068, 0.0058, 0, Math.PI * 2, true);
  outer.holes.push(hole);
  const tg = new THREE.ExtrudeGeometry(outer, { depth: 0.0007, bevelEnabled: true, bevelThickness: 0.0004, bevelSize: 0.0004, bevelSegments: 2, curveSegments: 32 });
  const tm = new THREE.Mesh(tg, gold()); tm.rotation.x = -Math.PI / 2; tm.castShadow = true; tab.add(tm);
  const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), gold()); rivet.scale.y = 0.4; tab.add(rivet);
  tab.position.set(0, H - 0.0043, 0.004); tab.rotation.y = 0.35; tab.scale.setScalar(1.35); g.add(tab);
  return g;
}
