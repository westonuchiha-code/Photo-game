// "Creepy character" from the hoodie-skull figurine photos: a tall, thin figure
// with an oversized bone-white skull (huge hollow eye sockets, small jaw) in a
// black hoodie, hands jammed in the front pocket, skinny faded ripped jeans and
// black high-tops with white toe caps. Slouched walk cycle.
// Local axes: faces +z, feet at y = 0. Original design inspired by the photos.
import * as THREE from 'three';

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, ...o });
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const part = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
};

// The skull: one sculpted mesh. Tall egg cranium narrowing to a small jaw,
// two huge deep eye holes with raised round rims (the inside shades to black),
// nose holes, a small open mouth, uneven clay surface. Vertex colours carry
// the bone tint and the darkness inside the holes.
function sculptSkull() {
  const geo = new THREE.SphereGeometry(1, 128, 96);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const v = new THREE.Vector3();
  const holes = [
    { c: new THREE.Vector3(-0.44, 0.2, 0.88).normalize(), R: 0.47, depth: 0.62, rim: 0.07 },   // eyes
    { c: new THREE.Vector3(0.44, 0.2, 0.88).normalize(), R: 0.47, depth: 0.62, rim: 0.07 },
    { c: new THREE.Vector3(-0.06, -0.2, 0.98).normalize(), R: 0.07, depth: 0.2, rim: 0 },      // nose
    { c: new THREE.Vector3(0.06, -0.2, 0.98).normalize(), R: 0.07, depth: 0.2, rim: 0 },
    { c: new THREE.Vector3(0, -0.52, 0.86).normalize(), R: 0.2, depth: 0.25, rim: 0.02 },      // mouth
  ];
  const n3 = (x, y, z) => Math.sin(x * 23 + y * 7) * Math.sin(y * 19 - z * 11) * Math.sin(z * 17 + x * 5);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let r = 1, dark = 0;
    for (const h of holes) {
      const d = Math.acos(Math.min(1, v.dot(h.c)));
      if (d < h.R) {
        const k = 1 - (d / h.R) ** 2;
        r -= h.depth * k;
        dark = Math.max(dark, Math.min(1, k * 1.8));
      } else if (d < h.R * 1.35 && h.rim) {
        r += h.rim * Math.sin(((d - h.R) / (h.R * 0.35)) * Math.PI);   // raised round rim
      }
    }
    r += 0.012 * n3(v.x, v.y, v.z);                    // clay unevenness
    // shape: tall cranium, cheekbones, narrow jaw
    let x = v.x * 0.15, y = v.y * 0.21, z = v.z * 0.15;
    if (v.y < 0) { const t = -v.y; x *= 1 - 0.38 * t; z *= 1 - 0.15 * t; }
    if (v.y < 0.05 && v.y > -0.35) x *= 1 + 0.06 * Math.exp(-(((v.y + 0.15) / 0.1) ** 2));   // cheekbones
    p.setXYZ(i, x * r, y * r, z * r);
    const b = 1 - 0.97 * dark;
    col[i * 3] = 1.0 * b; col[i * 3 + 1] = 0.93 * b; col[i * 3 + 2] = 0.8 * b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

export function makeCreep() {
  const g = new THREE.Group();
  g.name = 'creepy_hoodie_skull';

  // ---- materials (all share the sculpted-clay normal map)
  const clayN = new THREE.TextureLoader().load('assets/textures/clay_normal.png');
  clayN.wrapS = clayN.wrapT = THREE.RepeatWrapping;
  clayN.repeat.set(3, 3);
  const clay = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, normalMap: clayN, normalScale: new THREE.Vector2(1.4, 1.4), ...o });
  const fabric = canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#3d3d44'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '60,60,66' : '8,8,10'},0.35)`; x.fillRect(Math.random() * w, Math.random() * h, 2, 1); }
  });
  fabric.repeat.set(3, 3);
  const hoodie = clay({ map: fabric, roughness: 0.95 });
  const hoodieIn = std({ color: '#0b0b0c', roughness: 1, side: THREE.BackSide });
  const bone = clay({ vertexColors: true, roughness: 0.65, color: '#fff4dc', emissive: '#2a2416', normalScale: new THREE.Vector2(0.8, 0.8) });
  const socket = new THREE.MeshBasicMaterial({ color: '#050505' });
  const denim = canvasTex(256, 512, (x, w, h) => {
    x.fillStyle = '#6189bb'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '160,190,220' : '20,35,60'},0.18)`; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 6 + Math.random() * 20); }
    const fade = x.createRadialGradient(w / 2, h * 0.42, 10, w / 2, h * 0.42, 120);   // worn knees
    fade.addColorStop(0, 'rgba(190,210,230,0.55)'); fade.addColorStop(1, 'rgba(190,210,230,0)');
    x.fillStyle = fade; x.fillRect(0, 0, w, h);
    x.fillStyle = '#d9d4c6'; x.beginPath(); x.ellipse(w * 0.45, h * 0.45, 22, 12, 0.2, 0, 7); x.fill();  // the rip
    x.strokeStyle = '#efeadb'; x.lineWidth = 2;
    for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(w * 0.45 - 20, h * 0.45 - 8 + i * 3); x.lineTo(w * 0.45 + 20, h * 0.45 - 8 + i * 3); x.stroke(); }
  });
  const jeans = clay({ map: denim, roughness: 0.9 });
  const shoe = clay({ color: '#18181b', roughness: 0.7 });
  const rubber = clay({ color: '#e6e3d8', roughness: 0.6 });
  const lace = std({ color: '#d9d9d2' });

  // ---- body rig: pelvis -> torso -> head; hips -> legs
  const body = new THREE.Group();          // everything above the hips, slouched
  body.position.y = 0.92;
  g.add(body);

  // hoodie torso: tapered, slightly boxy, longer at the front pocket
  const torsoGeo = new THREE.CylinderGeometry(0.19, 0.165, 0.6, 20, 6);
  const tp = torsoGeo.attributes.position;
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), y = tp.getY(i), z = tp.getZ(i);
    const ang = Math.atan2(z, x);
    const fold = 1 + 0.035 * Math.sin(ang * 7 + y * 9) + 0.025 * Math.sin(y * 23 + ang * 3);   // cloth folds
    tp.setXYZ(i, x * 1.08 * fold, y, (z * 0.68 + (z > 0 ? 0.02 : 0)) * fold);
  }
  torsoGeo.computeVertexNormals();
  body.add(part(torsoGeo, hoodie, 0, 0.32, 0));
  // kangaroo pocket bulge + hands inside, waistband
  const pocket = new THREE.SphereGeometry(0.15, 18, 10);
  pocket.scale(1.05, 0.55, 0.45);
  body.add(part(pocket, hoodie, 0, 0.17, 0.09));
  const band = part(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 20), hoodie, 0, 0.02, 0);
  band.scale.set(1.08, 1, 0.72);
  body.add(band);
  // arms: from the shoulders down and forward into the pocket
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.2, 0.56, 0);
    const upper = part(new THREE.CapsuleGeometry(0.055, 0.26, 4, 10), hoodie, 0, -0.16, 0);
    arm.add(upper);
    const fore = part(new THREE.CapsuleGeometry(0.05, 0.22, 4, 10), hoodie, -s * 0.08, -0.36, 0.1);
    fore.rotation.z = -s * 0.75;   // forearm angles inward to the pocket
    fore.rotation.x = -0.5;
    arm.add(fore);
    arm.rotation.z = s * 0.12;
    body.add(arm);
  }
  // drawstrings
  for (const s of [-1, 1]) body.add(part(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6), std({ color: '#3a3a3e' }), s * 0.045, 0.53, 0.14));

  // ---- head: oversized skull deep in the hood
  const head = new THREE.Group();
  head.position.set(0, 0.8, 0.02);
  body.add(head);
  head.add(part(sculptSkull(), bone, 0, 0.0, 0.0));
  // hood: a deep shell open at the front, with the dark inside
  const hoodGeo = new THREE.SphereGeometry(0.235, 40, 28, Math.PI / 2 + 0.8, Math.PI * 2 - 1.6, 0, Math.PI * 0.78);
  hoodGeo.scale(1, 1.18, 1.05);
  { const hp = hoodGeo.attributes.position;   // fabric wrinkles on the hood
    for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i); const k = 1 + 0.04 * Math.sin(y * 40 + x * 12) * Math.sin(z * 25); hp.setXYZ(i, x * k, y, z * k); }
    hoodGeo.computeVertexNormals(); }
  const hood = new THREE.Mesh(hoodGeo, hoodie);
  hood.position.set(0, 0.02, -0.02);
  hood.castShadow = true;
  head.add(hood);
  const hoodInside = new THREE.Mesh(hoodGeo, hoodieIn);
  hoodInside.position.copy(hood.position);
  hoodInside.scale.setScalar(0.985);
  head.add(hoodInside);

  head.rotation.x = 0.18;          // head pushed forward and down

  // ---- legs: long and skinny, pivot at the hip
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(s * 0.085, 0.92, 0);
    const thigh = part(new THREE.CapsuleGeometry(0.06, 0.38, 4, 12), jeans, 0, -0.22, 0);
    hip.add(thigh);
    const knee = new THREE.Group();
    knee.position.y = -0.45;
    hip.add(knee);
    const shinGeo = new THREE.CapsuleGeometry(0.058, 0.4, 6, 14);
    { const q = shinGeo.attributes.position;
      for (let i = 0; i < q.count; i++) { const y = q.getY(i); const k = 1 + (y < -0.05 ? 0.12 * Math.abs(Math.sin(y * 45)) : 0.03 * Math.sin(y * 30)); q.setX(i, q.getX(i) * k); q.setZ(i, q.getZ(i) * k); }
      shinGeo.computeVertexNormals(); }
    const shin = part(shinGeo, jeans, 0, -0.18, 0);
    knee.add(shin);
    // high-top sneaker: black upper, white sole + toe cap, laces
    const foot = new THREE.Group();
    foot.position.y = -0.42;
    knee.add(foot);
    foot.add(part(new THREE.BoxGeometry(0.1, 0.12, 0.17), shoe, 0, 0.0, 0.03));
    foot.add(part(new THREE.BoxGeometry(0.11, 0.035, 0.27), rubber, 0, -0.06, 0.05));
    const toe = new THREE.SphereGeometry(0.055, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    toe.scale(1, 0.7, 1.1);
    foot.add(part(toe, rubber, 0, -0.045, 0.13));
    for (let i = 0; i < 4; i++) foot.add(part(new THREE.BoxGeometry(0.06, 0.006, 0.006), lace, 0, 0.0 + i * 0.025, 0.12 - i * 0.02));
    g.add(hip);
    legs.push({ hip, knee, foot, s });
  }

  // ---- walk cycle
  g.userData.pose = (phase) => {
    for (const { hip, knee, foot, s } of legs) {
      const a = Math.sin(phase + (s > 0 ? 0 : Math.PI));
      hip.rotation.x = a * 0.42;
      knee.rotation.x = Math.max(0, -Math.cos(phase + (s > 0 ? 0 : Math.PI))) * 0.55;
      foot.rotation.x = -hip.rotation.x * 0.5 - knee.rotation.x * 0.6;
    }
    body.position.y = 0.92 + Math.abs(Math.sin(phase)) * 0.025;
    body.rotation.x = 0.1;          // slouch
    body.rotation.y = Math.sin(phase) * 0.06;
    head.rotation.z = Math.sin(phase * 0.5) * 0.05;
  };
  g.userData.pose(0);
  return g;
}
