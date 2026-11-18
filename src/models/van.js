// Old two-tone minivan abandoned in a junkyard (old-van photo). Boxy 80s van:
// sloped nose, flat sides with a body crease, grey-tan upper / dark brown lower
// with two brown pinstripes, filthy dust-caked windows, rust-orange steel wheels.
// One rear wheel is off and the van sits on a block; the wheel lies beside it.
// Badge text is made up. Local axes: nose toward +z, ground y = 0.
import * as THREE from 'three';

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// dust / grime speckle over a canvas
function grime(x, w, h, n, col, rMax) {
  for (let i = 0; i < n; i++) {
    x.fillStyle = col.replace('A', (0.05 + Math.random() * 0.18).toFixed(2));
    x.beginPath();
    x.ellipse(Math.random() * w, Math.random() * h, 1 + Math.random() * rMax, 1 + Math.random() * rMax * 0.6, Math.random() * 3, 0, 7);
    x.fill();
  }
}

export function makeOldVan() {
  const g = new THREE.Group();
  g.name = 'old_van';
  const L = 4.3, W = 1.7, H = 1.8, clear = 0.32;
  const BELT = 1.02;      // height of the body crease / window line

  // side panel texture: tan upper, dark brown lower, two stripes, rust + dust
  const side = canvasTex(1024, 512, (x, w, h) => {
    const y = (m) => h - ((m - clear) / (H - clear)) * h;     // metres -> px
    x.fillStyle = '#8a857a'; x.fillRect(0, 0, w, h);          // tan-grey upper
    x.fillStyle = '#4a3a33'; x.fillRect(0, y(0.66), w, h);     // dark brown lower
    x.fillStyle = '#9a7e74'; x.fillRect(0, y(1.0), w, 10);     // stripes
    x.fillStyle = '#6b4a3a'; x.fillRect(0, y(0.95), w, 8);
    grime(x, w, h, 900, 'rgba(160,140,110,A)', 6);              // dust
    grime(x, w, h, 120, 'rgba(110,60,30,A)', 10);               // rust blooms
    const gr = x.createLinearGradient(0, h, 0, y(0.6));         // road grime at the bottom
    gr.addColorStop(0, 'rgba(70,55,40,0.85)'); gr.addColorStop(1, 'rgba(70,55,40,0)');
    x.fillStyle = gr; x.fillRect(0, y(0.6), w, h);
  });
  const body = new THREE.MeshStandardMaterial({ map: side, roughness: 0.85, metalness: 0.15 });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#a9ad9f', roughness: 0.9 });   // sun-bleached roof
  const dark = new THREE.MeshStandardMaterial({ color: '#2a2629', roughness: 0.8 });
  const dirtyGlass = new THREE.MeshStandardMaterial({
    map: canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#4a4d4c'; x.fillRect(0, 0, w, h); grime(x, w, h, 2500, 'rgba(170,162,140,A)', 2.5); const hz = x.createLinearGradient(0, h, 0, 0); hz.addColorStop(0, 'rgba(150,140,120,0.55)'); hz.addColorStop(1, 'rgba(150,140,120,0.15)'); x.fillStyle = hz; x.fillRect(0, 0, w, h); }),
    roughness: 0.4, metalness: 0.2, polygonOffset: true, polygonOffsetFactor: -4,
  });

  // body: extrude the side profile (z along length, y up) across the width
  const prof = new THREE.Shape();
  const P = [[-L / 2, clear], [L / 2 - 0.05, clear], [L / 2, clear + 0.3], [L / 2, 0.92],
    [L / 2 - 0.35, 1.15],                 // sloped hood up to the windshield base
    [L / 2 - 1.0, H - 0.05], [L / 2 - 1.15, H], [-L / 2 + 0.1, H], [-L / 2, H - 0.1], [-L / 2, clear]];
  P.forEach(([z, y], i) => (i ? prof.lineTo(z, y) : prof.moveTo(z, y)));
  const geo = new THREE.ExtrudeGeometry(prof, { depth: W, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
  geo.translate(0, 0, -W / 2);
  geo.rotateY(Math.PI / 2);           // shape x -> world -z ... rotate so length runs along z
  // map side UVs from world position so the stripes run straight
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getZ(i) + L / 2) / L, (pos.getY(i) - clear) / (H - clear));
  const shell = new THREE.Mesh(geo, body);
  shell.rotation.y = Math.PI;         // nose to +z
  shell.castShadow = shell.receiveShadow = true;
  g.add(shell);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, 0.02, L - 1.3), roofMat);
  roof.position.set(0, H + 0.035, -0.55);
  g.add(roof);

  // windows (dust-caked): sides, rear, windshield
  for (const s of [-1, 1]) {
    for (const [z0, z1] of [[-1.95, -0.95], [-0.85, 0.35], [0.45, 0.95]]) {
      const wgl = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, 0.58), dirtyGlass);
      wgl.position.set(s * (W / 2 + 0.065), BELT + 0.36, (z0 + z1) / 2);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.66, z1 - z0 + 0.08), dark);
      fr.position.set(s * (W / 2 + 0.05), BELT + 0.36, (z0 + z1) / 2);
      g.add(fr);
      wgl.rotation.y = s * Math.PI / 2;
      g.add(wgl);
    }
  }
  const rear = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.3, 0.55), dirtyGlass);
  rear.position.set(0, BELT + 0.38, -L / 2 - 0.065);
  rear.rotation.y = Math.PI;
  g.add(rear);
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.15, 0.82), dirtyGlass);
  const wsAng = Math.atan2(H - 0.05 - 1.15, 1.0 - 0.35);
  ws.rotation.x = -(Math.PI / 2 - wsAng);
  const wsN = new THREE.Vector3(0, 0, 1).applyEuler(ws.rotation);
  ws.position.set(0, (1.15 + H - 0.05) / 2, L / 2 - 0.675).addScaledVector(wsN, 0.07);
  const wsFrame = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.02, 0.92), dark);
  wsFrame.rotation.copy(ws.rotation);
  wsFrame.position.copy(ws.position).addScaledVector(wsN, -0.008);
  g.add(wsFrame);
  g.add(ws);
  for (const s of [-1, 1]) {       // wiper
    const wp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.015, 0.015), dark);
    wp.position.set(s * 0.32, 1.2, L / 2 - 0.37);
    wp.rotation.z = s * 0.15;
    g.add(wp);
  }

  // front: black grille band with a made-up badge, square headlights, amber corners, bumper
  const grille = canvasTex(512, 64, (x, w, h) => {
    x.fillStyle = '#25272c'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { x.fillStyle = '#353841'; x.fillRect(0, 6 + i * 9, w, 3); }
    x.fillStyle = '#c9cbd0'; x.font = 'bold 34px Arial'; x.textAlign = 'center'; x.fillText('KAZEMA', w / 2, 44);
  });
  const gf = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.5, 0.17), new THREE.MeshStandardMaterial({ map: grille, roughness: 0.5 }));
  gf.position.set(0, 0.78, L / 2 + 0.06);
  g.add(gf);
  const lamp = new THREE.MeshStandardMaterial({ color: '#8f9399', roughness: 0.3, metalness: 0.4 });
  const amber = new THREE.MeshStandardMaterial({ color: '#a8692a', roughness: 0.4 });
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.03), lamp);
    hl.position.set(s * (W / 2 - 0.2), 0.78, L / 2 + 0.055);
    g.add(hl);
    const am = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.03), amber);
    am.position.set(s * (W / 2 - 0.02), 0.78, L / 2 + 0.05);
    g.add(am);
  }
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(W + 0.12, 0.2, 0.18), dark);
  bumper.position.set(0, 0.48, L / 2 + 0.05);
  g.add(bumper);
  const rb = bumper.clone();
  rb.position.z = -L / 2 - 0.05;
  g.add(rb);
  // side mirror, door handles, sliding-door track
  const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.12), dark);
  mirror.position.set(W / 2 + 0.1, 1.3, L / 2 - 0.85);
  g.add(mirror);
  for (const [z, s] of [[0.42, 1], [-0.95, 1], [0.42, -1]]) {
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.14), dark);
    hd.position.set(s * (W / 2 + 0.045), 0.98, z);
    g.add(hd);
  }

  // wheels: dark tyres, rust-orange steel rims with holes and lug nuts
  const tyreMat = new THREE.MeshStandardMaterial({ color: '#1c1b1c', roughness: 0.95 });
  const rimTex = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#93704f'; x.fillRect(0, 0, w, h);
    grime(x, w, h, 300, 'rgba(120,60,25,A)', 8);
    x.fillStyle = '#3b2a1f';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; x.beginPath(); x.ellipse(128 + Math.cos(a) * 72, 128 + Math.sin(a) * 72, 16, 22, a, 0, 7); x.fill(); }
    x.beginPath(); x.arc(128, 128, 30, 0, 7); x.fill();
    x.fillStyle = '#a07a52'; x.beginPath(); x.arc(128, 128, 22, 0, 7); x.fill();
  });
  const rimMat = new THREE.MeshStandardMaterial({ map: rimTex, roughness: 0.7, metalness: 0.3 });
  const wheel = () => {
    const w = new THREE.Group();
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.1, 12, 28), tyreMat);
    t.rotation.y = Math.PI / 2;
    w.add(t);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.16, 28), [rimMat, rimMat, rimMat]);
    rim.rotation.z = Math.PI / 2;
    // map the rim texture onto its caps
    w.add(rim);
    w.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return w;
  };
  const AXF = L / 2 - 0.75, AXR = -L / 2 + 0.85, WR = 0.37;
  for (const [x, z, on] of [[W / 2 - 0.05, AXF, true], [-W / 2 + 0.05, AXF, true], [-W / 2 + 0.05, AXR, true], [W / 2 - 0.05, AXR, false]]) {
    if (on) {
      const w = wheel();
      w.position.set(x + Math.sign(x) * 0.02, WR, z);
      g.add(w);
    } else {
      // missing wheel: bare brake drum on a block
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 18), new THREE.MeshStandardMaterial({ color: '#5a3a26', roughness: 0.8 }));
      drum.rotation.z = Math.PI / 2;
      drum.position.set(x + 0.02, WR, z);
      g.add(drum);
      const blk = new THREE.Mesh(new THREE.BoxGeometry(0.3, WR - 0.13, 0.4), new THREE.MeshStandardMaterial({ color: '#7b7a74', roughness: 0.95 }));
      blk.position.set(x, (WR - 0.13) / 2, z);
      g.add(blk);
    }
    // wheel-well shadow
    const well = new THREE.Mesh(new THREE.CircleGeometry(0.44, 24, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#0d0c0c', roughness: 1 }));
    well.position.set(x + Math.sign(x) * 0.045, WR, z);
    well.rotation.y = Math.sign(x) * Math.PI / 2;
    g.add(well);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.025, 6, 24, Math.PI), new THREE.MeshStandardMaterial({ color: '#7a655b', roughness: 0.8 }));
    lip.position.copy(well.position);
    lip.rotation.y = well.rotation.y;
    g.add(lip);
  }
  // the loose wheel lying flat beside the van
  const loose = wheel();
  loose.rotation.z = Math.PI / 2;
  loose.position.set(W / 2 + 0.6, 0.09, AXR + 0.3);
  g.add(loose);

  // junkyard flood light on a pole beside it
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 4.2, 8), dark);
  pole.position.set(-W / 2 - 1.6, 2.1, 0.6);
  g.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.7, 1.4), toneMapped: false }));
  head.position.set(-W / 2 - 1.35, 4.15, 0.6);
  g.add(head);
  const flood = new THREE.PointLight('#ffe8c4', 6, 12, 1.6);
  flood.position.set(-W / 2 - 1.0, 3.8, 0.8);
  g.add(flood);
  g.userData.size = { w: W, l: L };
  return g;
}
