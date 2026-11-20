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

// ---------------------------------------------------------------------------------------------------------
//   makeSoundCard()  homebrew expansion sound card (sound-card-board.jpg): 22 x 13 cm green card, the photo
//   itself straightened (traces, silkscreen, resistors, DIP switches) with the acrylic glare painted out and
//   the real product name removed; a made-up "TAMA BUS · FM SOUND" silkscreened on the edge. 3D: DIP chips
//   with generic part numbers and legs, two blue DIP switch blocks, an upright capacitor, pin headers, the two
//   long black bus connectors, gold fingers, a blue daughterboard on four white standoffs with two RCA jacks,
//   lying on a sheet of pink bubble wrap. Lies flat; origin at the card centre, fingers toward +z.
export function makeSoundCard() {
  const g = new THREE.Group(); g.name = 'sound_card';
  const W = 0.22, Dp = 0.13, T = 0.0016;
  const L = { tabY: 0.9592, tab: [0.07, 0.9425], chips: {}, dip: [], cap: [0.05, 0.75], daughter: [[0.1, 0.4], [0.6, 0.4]], ext1: [[0, 0.4], [0.05, 0.6]], ext2: [[0.95, 0.4], [0.99, 0.5]], edge: [[0.05, 0.88], [0.94, 0.95]], jacks: [] };
  const U = (u) => (u - 0.5) * W, V = (v) => (v - 0.5) * Dp;
  const bt = tex('sc_board'); bt.colorSpace = THREE.SRGBColorSpace;
  const top = new THREE.Mesh(new THREE.PlaneGeometry(W, Dp), new THREE.MeshStandardMaterial({ map: bt, transparent: true, alphaTest: 0.5, roughness: 0.45 }));
  top.rotation.x = -Math.PI / 2; top.position.y = T + 0.0002; top.receiveShadow = true; g.add(top);
  const green = new THREE.MeshStandardMaterial({ color: '#1f6a2c', roughness: 0.5 });
  const pcbBody = (u0, u1, v0, v1) => box(U(u1) - U(u0), T, V(v1) - V(v0), green, (U(u0) + U(u1)) / 2, T / 2, (V(v0) + V(v1)) / 2, g);
  const parts = new THREE.Group(); g.add(parts);
  fetch('assets/textures/sc_board.json').then((r) => r.json()).then((j) => { Object.assign(L, j); build(); }).catch(build);
  function build() {
    const L0 = L; const Ty = L0.tabY;
    pcbBody(0, 0.9825, 0, Ty); pcbBody(L0.tab[0], L0.tab[1], Ty, 1);
    const chipM = new THREE.MeshStandardMaterial({ color: '#1c1c1e', roughness: 0.55 }), leg = new THREE.MeshStandardMaterial({ color: '#c8c8c4', metalness: 0.8, roughness: 0.3 });
    const names = { IC1: '74HC04', IC2: '74HC08', IC3: '74HC32', IC4: '74HC138', IC5: '74HC245', IC6: '74HC74', IC7: '74LS245', RN: '10K' };
    for (const [n, [[u0, v0], [u1, v1]]] of Object.entries(L0.chips)) {
      const w = U(u1) - U(u0), d = V(v1) - V(v0), h = n === 'RN' ? 0.005 : 0.0035;
      const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#1c1c1e'; x.fillRect(0, 0, 256, 64);
      x.fillStyle = '#9a9a98'; fitText(x, names[n], 128, 30, 220, 30, F.small, { spacing: 2 }); x.beginPath(); x.arc(14, 32, 7, 0, 7); x.fillStyle = '#111'; x.fill();
      const lt = new THREE.CanvasTexture(c); lt.colorSpace = THREE.SRGBColorSpace;
      const mats = [chipM, chipM, new THREE.MeshStandardMaterial({ map: lt, roughness: 0.55 }), chipM, chipM, chipM];
      const ch = new THREE.Mesh(new THREE.BoxGeometry(w, h, d * 0.62), mats); ch.position.set((U(u0) + U(u1)) / 2, T + 0.001 + h / 2, (V(v0) + V(v1)) / 2); ch.castShadow = true; parts.add(ch);
      const nl = Math.max(4, Math.round(w / 0.00254));
      for (let i = 0; i < nl; i++) for (const sd of [-1, 1]) box(0.0006, 0.004, 0.0012, leg, U(u0) + (i + 0.5) * w / nl, T + 0.0018, ch.position.z + sd * d * 0.34, parts);
    }
    const dipM = new THREE.MeshStandardMaterial({ color: '#2a6ad8', roughness: 0.35 }), white = new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.4 });
    for (const [[u0, v0], [u1, v1]] of L0.dip) {
      const w = U(u1) - U(u0), d = V(v1) - V(v0);
      box(w, 0.005, d, dipM, (U(u0) + U(u1)) / 2, T + 0.0025, (V(v0) + V(v1)) / 2, parts);
      for (let i = 0; i < 4; i++) box(w / 7, 0.0015, d * 0.25, white, U(u0) + (i + 0.5) * w / 4, T + 0.0055, (V(v0) + V(v1)) / 2 + (i % 2 ? -1 : 1) * d * 0.12, parts);
    }
    const cap = cyl(0.0068, 0.012, new THREE.MeshStandardMaterial({ color: '#5aa8e0', roughness: 0.35 }), parts, 24); cap.position.set(U(L0.cap[0]), T + 0.006, V(L0.cap[1]));
    const capTop = cyl(0.0062, 0.0006, new THREE.MeshStandardMaterial({ color: '#b8bcc0', metalness: 0.7, roughness: 0.3 }), parts, 24); capTop.position.set(U(L0.cap[0]), T + 0.0122, V(L0.cap[1]));
    // headers + the two long bus connectors (black with a row of holes)
    const hc = document.createElement('canvas'); hc.width = 512; hc.height = 32; const hx = hc.getContext('2d'); hx.fillStyle = '#121212'; hx.fillRect(0, 0, 512, 32); hx.fillStyle = '#3a3a3a'; for (let i = 0; i < 50; i++) for (const r of [9, 23]) { hx.fillRect(i * 10.24 + 3, r - 3, 4, 6); }
    const ht = new THREE.CanvasTexture(hc); ht.colorSpace = THREE.SRGBColorSpace; ht.wrapS = THREE.RepeatWrapping;
    const blk = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.5 });
    const header = (a, b, h) => { const w = U(b[0]) - U(a[0]), d = V(b[1]) - V(a[1]); const t2 = ht.clone(); t2.needsUpdate = true; t2.repeat.set(Math.max(w, d) / 0.05, 1); if (d > w) t2.rotation = Math.PI / 2; const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [blk, blk, new THREE.MeshStandardMaterial({ map: t2, roughness: 0.5 }), blk, blk, blk]); m.position.set((U(a[0]) + U(b[0])) / 2, T + h / 2, (V(a[1]) + V(b[1])) / 2); m.castShadow = true; parts.add(m); };
    header(L0.edge[0], [(L0.edge[0][0] + L0.edge[1][0]) / 2 - 0.004, L0.edge[1][1]], 0.0085); header([(L0.edge[0][0] + L0.edge[1][0]) / 2 + 0.004, L0.edge[0][1]], L0.edge[1], 0.0085);
    header(L0.ext1[0], L0.ext1[1], 0.0085); header(L0.ext2[0], L0.ext2[1], 0.0085);
    // blue daughterboard on four white standoffs, the photo of it on top, two RCA jacks at its back edge
    const [[du0, dv], [du1]] = L0.daughter, dw = U(du1) - U(du0), dd = dw * 840 / 1024, dz = V(dv) - dd / 2, dx = (U(du0) + U(du1)) / 2, dy = T + 0.012;
    const dt = tex('sc_daughter');
    const dau = new THREE.Mesh(new THREE.BoxGeometry(dw, T, dd), [green, green, new THREE.MeshStandardMaterial({ map: dt, roughness: 0.45 }), new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.5 }), green, green]);
    dau.material[0] = dau.material[1] = dau.material[4] = dau.material[5] = new THREE.MeshStandardMaterial({ color: '#203c90' });
    dau.position.set(dx, dy, dz); dau.castShadow = true; parts.add(dau);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const so = cyl(0.0028, 0.011, white, parts, 10); so.position.set(dx + sx * (dw / 2 - 0.006), T + 0.0055, dz + sz * (dd / 2 - 0.006)); }
    for (const sx of [0.37, 0.63]) { const j = cyl(0.0045, 0.012, blk, parts, 16); j.rotation.x = Math.PI / 2; j.position.set(dx + (sx - 0.5) * dw, dy + 0.005, dz - dd / 2 - 0.004); const tip = cyl(0.0018, 0.004, new THREE.MeshStandardMaterial({ color: '#c8a040', metalness: 0.8, roughness: 0.3 }), parts, 10); tip.rotation.x = Math.PI / 2; tip.position.set(j.position.x, j.position.y, j.position.z - 0.007); }
    // made-up silkscreen along the right edge
    const sc = document.createElement('canvas'); sc.width = 512; sc.height = 64; const sx2 = sc.getContext('2d'); sx2.fillStyle = '#f2f2ee'; fitText(sx2, 'TAMA BUS  ·  FM SOUND', 256, 34, 490, 40, F.wayfind, { spacing: 4 });
    const stt = new THREE.CanvasTexture(sc); stt.colorSpace = THREE.SRGBColorSpace;
    const silk = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.0075), new THREE.MeshBasicMaterial({ map: stt, transparent: true, color: '#d8d8d4' }));
    silk.rotation.x = -Math.PI / 2; silk.rotation.z = Math.PI / 2; silk.position.set(U(0.955), T + 0.0004, V(0.78)); parts.add(silk);
  }
  // pink bubble wrap underneath
  const bc = document.createElement('canvas'); bc.width = bc.height = 256; const bx = bc.getContext('2d');
  bx.fillStyle = '#e888b4'; bx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const cx = i * 32 + (j % 2) * 16 + 8, cy = j * 32 + 16; const gr = bx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 13); gr.addColorStop(0, '#fff0f6'); gr.addColorStop(0.4, '#f0a0c8'); gr.addColorStop(1, '#d8709e'); bx.fillStyle = gr; bx.beginPath(); bx.arc(cx, cy, 12, 0, 7); bx.fill(); }
  const bwt = new THREE.CanvasTexture(bc); bwt.colorSpace = THREE.SRGBColorSpace; bwt.wrapS = bwt.wrapT = THREE.RepeatWrapping; bwt.repeat.set(10, 7);
  const wrap = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.22, 16, 12), new THREE.MeshStandardMaterial({ map: bwt, roughness: 0.25 }));
  const wp = wrap.geometry.attributes.position; for (let i = 0; i < wp.count; i++) wp.setZ(i, 0.002 * Math.sin(wp.getX(i) * 40) * Math.cos(wp.getY(i) * 30) - 0.002); wrap.geometry.computeVertexNormals();
  wrap.rotation.x = -Math.PI / 2; wrap.position.y = -0.006; wrap.rotation.z = 0.08; g.add(wrap);
  g.position.y = 0.006;
  const root = new THREE.Group(); root.name = 'sound_card_set'; root.add(g); return root;
}

// ---------------------------------------------------------------------------------------------------------
//   Handheld consoles (handheld-*.jpg, retro-handheld-black-gold.jpg): original designs in the styles of the
//   shop-case photos, made-up maker "PIXEL ARK" and model names, original pixel-art screens and cartridges.
//   makeHandheld(style)  'wide' black landscape with a round d-pad pod (also 'wideRed'), 'pad' big-screen
//   black with six face buttons, 'slim' white with orange/grey buttons, 'gold' black oval with yellow
//   buttons and a cartridge in the top slot. Screen faces +z, standing upright, origin at the bottom centre.
//   makeHandheldCase()  1.4 x 1.25 x 0.6 m glass shop case: two glass tiers of handhelds on acrylic stands,
//   boxed cartridges with made-up art, price cards, a colour-cycling LED puck, a "DISPLAY ONLY" card.
function pixelScreen(kind) {
  const c = document.createElement('canvas'); c.width = 160; c.height = 120; const x = c.getContext('2d');
  let s = kind.length * 97 + 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  if (kind === 'shooter') {
    x.fillStyle = '#05061a'; x.fillRect(0, 0, 160, 120);
    for (let i = 0; i < 60; i++) { x.fillStyle = r() < 0.2 ? '#9cf' : '#fff'; x.fillRect(Math.floor(r() * 160), Math.floor(r() * 120), 1, 1); }
    x.fillStyle = '#4ad'; x.fillRect(74, 96, 12, 6); x.fillStyle = '#fff'; x.fillRect(78, 90, 4, 6); x.fillStyle = '#f84'; x.fillRect(77, 102, 6, 3);
    for (let i = 0; i < 6; i++) { const ex = 20 + i * 22, ey = 24 + (i % 2) * 14; x.fillStyle = '#e4e'; x.fillRect(ex, ey, 10, 6); x.fillStyle = '#ff4'; x.fillRect(ex + 3, ey + 6, 4, 2); }
    x.fillStyle = '#ff6'; for (let i = 0; i < 4; i++) x.fillRect(79, 40 + i * 12, 2, 5);
    x.fillStyle = '#fff'; x.font = '8px monospace'; x.fillText('SCORE 004120', 4, 9); x.fillText('HI 050000', 100, 9);
  } else if (kind === 'menu') {
    x.fillStyle = '#10208a'; x.fillRect(0, 0, 160, 120); x.fillStyle = '#e8e8ff'; x.font = '9px monospace';
    ['SELECT GAME', '', '> STAR PUFF', '  MOLE MINER', '  TIDE RUNNER', '  BRICK OWL', '  KITE WARS', '  NOODLE CHEF'].forEach((t, i) => x.fillText(t, 10, 14 + i * 13));
    x.fillStyle = '#ff6'; x.fillRect(8, 31, 4, 4);
  } else if (kind === 'platform') {
    x.fillStyle = '#68b8f8'; x.fillRect(0, 0, 160, 120); x.fillStyle = '#fff'; for (const [cx, cy] of [[30, 20], [110, 30]]) { x.fillRect(cx, cy, 20, 6); x.fillRect(cx + 4, cy - 4, 12, 4); }
    x.fillStyle = '#3a9a3a'; x.fillRect(0, 100, 160, 20); x.fillStyle = '#8a5a2a'; for (let i = 0; i < 16; i++) x.fillRect(i * 10, 104, 9, 3);
    x.fillStyle = '#c8783a'; for (let i = 0; i < 4; i++) x.fillRect(60 + i * 10, 64, 9, 9); x.fillStyle = '#ffd040'; x.fillRect(80, 64, 9, 9);
    x.fillStyle = '#e03030'; x.fillRect(30, 86, 8, 8); x.fillStyle = '#f8c890'; x.fillRect(31, 80, 6, 6); x.fillStyle = '#3040c0'; x.fillRect(30, 94, 8, 6);
    x.fillStyle = '#6a3a1a'; x.fillRect(120, 92, 10, 8); x.fillStyle = '#fff'; x.font = '8px monospace'; x.fillText('WORLD 1-2', 4, 9); x.fillText('x03', 130, 9);
  } else {
    const gr = x.createLinearGradient(0, 0, 0, 120); gr.addColorStop(0, '#f8a8d8'); gr.addColorStop(1, '#a8d8f8'); x.fillStyle = gr; x.fillRect(0, 0, 160, 120);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(80, 52, 22, 0, 7); x.fill(); x.fillStyle = '#f070b0'; x.beginPath(); x.arc(80, 52, 18, 0, 7); x.fill();
    x.fillStyle = '#222'; x.fillRect(72, 46, 4, 6); x.fillRect(84, 46, 4, 6); x.fillStyle = '#fff'; x.font = 'bold 13px monospace'; x.fillText('STAR PUFF', 44, 92); x.font = '8px monospace'; x.fillText('PUSH START', 54, 108);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; return t;
}
function roundedShape(w, h, rc) { const s = new THREE.Shape(); s.moveTo(-w / 2 + rc, -h / 2); s.lineTo(w / 2 - rc, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rc); s.lineTo(w / 2, h / 2 - rc); s.quadraticCurveTo(w / 2, h / 2, w / 2 - rc, h / 2); s.lineTo(-w / 2 + rc, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rc); s.lineTo(-w / 2, -h / 2 + rc); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rc, -h / 2); return s; }
export function makeCartridge(title = 'STAR PUFF', shell = '#3a3a3c', art = '#f070b0', w = 0.058, h = 0.064) {
  const g = new THREE.Group(); g.name = 'cartridge';
  const sm = new THREE.MeshStandardMaterial({ color: shell, roughness: 0.5 });
  const geo = new THREE.ExtrudeGeometry(roundedShape(w, h, 0.004), { depth: 0.008, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 1 }); geo.translate(0, h / 2, -0.004);
  g.add(new THREE.Mesh(geo, sm));
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, art); gr.addColorStop(1, '#202040'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.6})`; x.fillRect(Math.random() * 256, Math.random() * 180, 3, 3); }
  x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 110, 46, 0, 7); x.fill(); x.fillStyle = art; x.beginPath(); x.arc(128, 110, 38, 0, 7); x.fill();
  x.fillStyle = '#111'; x.fillRect(60, 196, 136, 44); x.fillStyle = '#fff'; fitText(x, title, 128, 218, 128, 30, F.retro, { spacing: 2 });
  const lt = new THREE.CanvasTexture(c); lt.colorSpace = THREE.SRGBColorSpace;
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.62), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.4 })); lab.position.set(0, h * 0.58, 0.0052); g.add(lab);
  for (let i = 0; i < 4; i++) { const rib = box(w * 0.7, 0.0012, 0.001, sm, 0, h * 0.1 + i * 0.003, 0.0052, g); rib.castShadow = false; }
  return g;
}
export function makeHandheld(style = 'wide') {
  const g = new THREE.Group(); g.name = 'handheld_' + style;
  const S = {
    wide: { w: 0.21, h: 0.112, rc: 0.05, body: '#1c1c1e', btn: '#2a2a2c', btnB: '#2a2a2c', scr: [0.082, 0.062], bez: [0.118, 0.088], screen: 'title', name: 'PIXEL ARK  COLOR', model: 'WIDEBOY' },
    wideRed: { w: 0.21, h: 0.112, rc: 0.05, body: '#c8202a', btn: '#1a1a1a', btnB: '#1a1a1a', scr: [0.082, 0.062], bez: [0.118, 0.088], screen: 'menu', name: 'PIXEL ARK  COLOR', model: 'WIDEBOY' },
    pad: { w: 0.168, h: 0.092, rc: 0.026, body: '#1a1a1c', btn: '#38383c', btnB: '#38383c', scr: [0.07, 0.052], bez: [0.088, 0.07], screen: 'shooter', name: 'PIXEL ARK', model: 'ROVER 6' },
    slim: { w: 0.152, h: 0.074, rc: 0.012, body: '#ececea', btn: '#e8742a', btnB: '#9a9a98', scr: [0.064, 0.046], bez: [0.084, 0.062], screen: 'platform', name: 'PIXEL ARK', model: 'POCKET MK2' },
    gold: { w: 0.205, h: 0.098, rc: 0.046, body: '#121214', btn: '#f0c020', btnB: '#f0c020', scr: [0.09, 0.056], bez: [0.104, 0.07], screen: 'shooter', name: 'PIXEL ARK', model: 'GOLD DELUXE' },
  }[style];
  const D = 0.032;
  const bm = new THREE.MeshStandardMaterial({ color: S.body, roughness: style === 'slim' ? 0.45 : 0.35, metalness: 0.05 });
  const geo = new THREE.ExtrudeGeometry(roundedShape(S.w, S.h, S.rc), { depth: D - 0.008, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 4, curveSegments: 16 });
  geo.translate(0, S.h / 2 + 0.004, -(D - 0.008) / 2);
  const body = new THREE.Mesh(geo, bm); body.castShadow = true; g.add(body);
  const fz = D / 2 + 0.0002, cy = S.h / 2 + 0.004;
  // printed face: bezel, labels, speaker holes
  const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * S.h / S.w); const x = c.getContext('2d'); const k = 512 / S.w;
  x.clearRect(0, 0, c.width, c.height);
  const bx = (c.width - S.bez[0] * k) / 2, by = (c.height - S.bez[1] * k) / 2 - (style === 'pad' ? 0 : 6);
  x.fillStyle = style === 'slim' ? '#2a2a2c' : '#0a0a0c'; x.beginPath(); x.roundRect(bx, by, S.bez[0] * k, S.bez[1] * k, 14); x.fill();
  x.fillStyle = style === 'gold' ? '#f0c020' : '#9a9aa0'; fitText(x, S.name, c.width / 2, by + S.bez[1] * k - 9, S.bez[0] * k * 0.7, 13, F.wayfind, { spacing: 3 });
  x.fillStyle = style === 'slim' ? '#888' : (style === 'gold' ? '#f0c020' : '#b8b8be'); fitText(x, S.model, c.width / 2, c.height - 14, 200, 20, style === 'gold' ? F.engraved : F.retro, { spacing: 3 });
  x.fillStyle = style === 'slim' ? '#bbb' : '#000'; for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(c.width - 60 + i * 10, c.height - 60 + j * 9, 2.5, 0, 7); x.fill(); }
  x.fillStyle = '#e03030'; x.beginPath(); x.arc(bx + 14, by + 16, 4, 0, 7); x.fill();
  const ft = new THREE.CanvasTexture(c); ft.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(S.w, S.h), new THREE.MeshStandardMaterial({ map: ft, transparent: true, roughness: 0.4 })); face.position.set(0, cy, fz + 0.0035); g.add(face);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(S.scr[0], S.scr[1]), new THREE.MeshBasicMaterial({ map: pixelScreen(S.screen) }));
  scr.position.set(0, cy + (style === 'pad' ? 0 : 6 / k) + 0.003, fz + 0.0038); g.add(scr);
  // controls
  const bt = new THREE.MeshStandardMaterial({ color: S.btn, roughness: 0.4 }), btB = new THREE.MeshStandardMaterial({ color: S.btnB, roughness: 0.4 });
  const dx = -S.w / 2 + Math.min(0.04, S.w * 0.18), bxR = S.w / 2 - Math.min(0.04, S.w * 0.18), z0 = fz + 0.004;
  if (style.startsWith('wide')) { const pod = cyl(0.022, 0.002, new THREE.MeshStandardMaterial({ color: '#0e0e10' }), g, 28); pod.rotation.x = Math.PI / 2; pod.position.set(dx, cy, z0); }
  const dpm = style === 'gold' ? bt : new THREE.MeshStandardMaterial({ color: '#202022', roughness: 0.45 });
  box(0.028, 0.009, 0.004, dpm, dx, cy, z0 + 0.002, g); box(0.009, 0.028, 0.004, dpm, dx, cy, z0 + 0.002, g);
  const btn = (bx2, by2, r, m) => { const b = cyl(r, 0.004, m, g, 20); b.rotation.x = Math.PI / 2; b.position.set(bx2, by2, z0 + 0.002); };
  if (style === 'pad') { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) btn(bxR - 0.016 + i * 0.012, cy + 0.006 - j * 0.014 + i * 0.002, 0.0048, bt); }
  else { btn(bxR + 0.008, cy + 0.006, 0.0068, bt); btn(bxR - 0.01, cy - 0.006, 0.0068, btB); }
  const pill = (px, py) => { const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.0025, 0.008, 4, 8), new THREE.MeshStandardMaterial({ color: style === 'slim' ? '#9a9a98' : '#404044' })); p.rotation.z = Math.PI / 2 - 0.4; p.position.set(px, py, z0 + 0.001); g.add(p); };
  if (style === 'slim') { pill(-0.012, cy - S.h / 2 + 0.008); pill(0.012, cy - S.h / 2 + 0.008); } else pill(bxR + 0.004, cy + S.h * 0.32);
  // top edge: cartridge slot (the gold one has a cartridge in it), shoulder bumps on the wide ones
  if (style === 'gold') { const cart = makeCartridge('MOLE MINER', '#2a2a2c', '#40a060', 0.07, 0.05); cart.position.set(0, cy + S.h / 2 - 0.02, -0.002); g.add(cart); }
  else box(0.06, 0.004, 0.012, new THREE.MeshStandardMaterial({ color: '#050505' }), 0, cy + S.h / 2 + 0.003, -0.004, g);
  return g;
}
export function makeGameBox(t = 'STAR PUFF', a = '#f070b0') {
  const cbox = new THREE.Group(); cbox.name = 'game_box';
  const bc = document.createElement('canvas'); bc.width = 192; bc.height = 256; const bx = bc.getContext('2d');
  let s = t.length * 31 + a.charCodeAt(1); const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const gr = bx.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, a); gr.addColorStop(1, '#101030'); bx.fillStyle = gr; bx.fillRect(0, 0, 192, 256);
  for (let n = 0; n < 40; n++) { bx.fillStyle = `rgba(255,255,255,${r()})`; bx.fillRect(r() * 192, r() * 256, 2, 2); }
  bx.fillStyle = '#fff'; bx.strokeStyle = '#000'; bx.lineWidth = 5; fitText(bx, t, 96, 40, 176, 34, F.retro, { stroke: 1 });
  bx.fillStyle = '#fff'; bx.beginPath(); bx.arc(96, 140, 44, 0, 7); bx.fill(); bx.fillStyle = a; bx.beginPath(); bx.arc(96, 140, 36, 0, 7); bx.fill();
  bx.fillStyle = '#fff'; bx.fillRect(84, 128, 8, 10); bx.fillRect(100, 128, 8, 10);
  bx.fillStyle = '#111'; bx.fillRect(0, 226, 192, 30); bx.fillStyle = '#ddd'; fitText(bx, 'PIXEL ARK', 96, 241, 120, 16, F.wayfind, { spacing: 2 });
  const tt = new THREE.CanvasTexture(bc); tt.colorSpace = THREE.SRGBColorSpace;
  const side = new THREE.MeshStandardMaterial({ color: a, roughness: 0.5 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.095, 0.02), [side, side, side, side, new THREE.MeshStandardMaterial({ map: tt, roughness: 0.45 }), side]); b.position.y = 0.0475; b.castShadow = true; cbox.add(b);
  return cbox;
}
export function makeHandheldCase() {
  const g = new THREE.Group(); g.name = 'handheld_case';
  const W = 1.4, H = 1.25, D = 0.6, BH = 0.82;
  const glass = new THREE.MeshStandardMaterial({ color: '#d8e6ea', transparent: true, opacity: 0.14, roughness: 0.04, depthWrite: false });
  const blackM = new THREE.MeshStandardMaterial({ color: '#1a1a1c', roughness: 0.5 }), alu = new THREE.MeshStandardMaterial({ color: '#c3c6c8', metalness: 0.5, roughness: 0.3 });
  box(W, BH, D, blackM, 0, BH / 2, 0, g);
  const gl = box(W - 0.02, H - BH, D - 0.02, glass, 0, BH + (H - BH) / 2, 0, g); gl.castShadow = false;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.02, H - BH, 0.02, alu, sx * (W / 2 - 0.01), BH + (H - BH) / 2, sz * (D / 2 - 0.01), g);
  for (const y of [BH, H]) for (const sz of [-1, 1]) box(W, 0.02, 0.02, alu, 0, y, sz * (D / 2 - 0.01), g);
  // white floor sheet + a stepped acrylic riser at the back
  const floor = box(W - 0.04, 0.004, D - 0.04, new THREE.MeshStandardMaterial({ color: '#f2f2f0', roughness: 0.7 }), 0, BH + 0.002, 0, g); floor.castShadow = false;
  const acr = new THREE.MeshStandardMaterial({ color: '#eef4f6', transparent: true, opacity: 0.45, roughness: 0.1 });
  box(W - 0.1, 0.12, 0.22, acr, 0, BH + 0.064, -0.15, g);
  const stand = (obj, px, py, pz, tilt = 0.25) => { const s = new THREE.Group(); s.position.set(px, py, pz); g.add(s); const st = box(0.06, 0.04, 0.05, acr, 0, 0.02, -0.01, s); st.rotation.x = -0.3; obj.rotation.x = -tilt; obj.position.set(0, 0.004, 0.012); s.add(obj); return s; };
  // back tier: three handhelds; front: two more + cartridges
  stand(makeHandheld('wide'), -0.42, BH + 0.124, -0.15); stand(makeHandheld('pad'), 0.0, BH + 0.124, -0.15); stand(makeHandheld('gold'), 0.42, BH + 0.124, -0.15);
  stand(makeHandheld('wideRed'), -0.25, BH + 0.004, 0.13); stand(makeHandheld('slim'), 0.3, BH + 0.004, 0.13);
  [['STAR PUFF', '#f070b0'], ['TIDE RUNNER', '#2a8ad0'], ['KITE WARS', '#e0a020'], ['BRICK OWL', '#8a4ad0']].forEach(([t, a], i) => {
    const b = makeGameBox(t, a); b.position.set(-0.6 + i * 0.07 + (i > 1 ? 0.95 : 0), BH + 0.004, 0.08 + (i % 2) * 0.05); b.rotation.y = (i % 2 ? -0.2 : 0.2); g.add(b);
  });
  // a back row of boxed games along the riser, and loose cartridges at the front
  const titles = [['MOLE MINER', '#40a060'], ['NOODLE CHEF', '#e0a020'], ['SKY LANCE', '#2ab0c0'], ['GHOST POST', '#7050c0'], ['ROBO DOJO', '#d04030'], ['MOON CART', '#d0c040'], ['FROG KNIGHT', '#30a050'], ['NEON RALLY', '#e040a0'], ['BIT TOWER', '#4060d0'], ['PIE SUMO', '#e08040']];
  titles.forEach(([t, a], i) => { const bx2 = makeGameBox(t, a); bx2.position.set(-0.62 + i * 0.135 + (i > 4 ? 0.04 : 0), BH + 0.124, -0.235); bx2.rotation.y = (i % 3 - 1) * 0.06; g.add(bx2); });
  [['KITE WARS', '#3a3a3c', '#e0a020'], ['TIDE RUNNER', '#e8e6e0', '#2a8ad0'], ['BRICK OWL', '#2a2a2c', '#8a4ad0']].forEach(([t, sh, a], i) => { const c2 = makeCartridge(t, sh, a); c2.rotation.x = -Math.PI / 2 + 0.02; c2.rotation.z = (i - 1) * 0.4; c2.position.set(-0.08 + i * 0.07, BH + 0.01, 0.12 + (i % 2) * 0.03); g.add(c2); });
  const loose = makeCartridge('NOODLE CHEF', '#e8e6e0', '#e0a020'); loose.rotation.x = -Math.PI / 2 + 0.02; loose.position.set(0.02, BH + 0.01, 0.18); loose.rotation.z = 0.3; g.add(loose);
  // price cards (folded tents) and the display-only card
  const card = (txt, sub, px, pz) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#fffbe6'; x.fillRect(0, 0, 256, 128);
    x.fillStyle = '#c81e28'; fitText(x, txt, 128, 52, 230, 52, F.condensed, { spacing: 2 }); x.fillStyle = '#333'; fitText(x, sub, 128, 102, 230, 22, F.small);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.04), new THREE.MeshStandardMaterial({ map: t, roughness: 0.7, side: THREE.DoubleSide })); m.position.set(px, BH + 0.022, pz); m.rotation.x = -0.35; g.add(m);
  };
  card('¥14,800', 'WIDEBOY · used · works', -0.42, 0.24); card('¥9,800', 'POCKET MK2 · boxed', 0.3, 0.25); card('DISPLAY ONLY', 'not for sale', -0.05, 0.25);
  // colour-cycling LED puck
  const puck = cyl(0.04, 0.012, new THREE.MeshStandardMaterial({ color: '#202022' }), g, 28); puck.position.set(0.6, BH + 0.01, 0.15);
  const ledM = new THREE.MeshBasicMaterial({ color: '#80c0ff' }); const led = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.004, 8, 32), ledM); led.rotation.x = -Math.PI / 2; led.position.set(0.6, BH + 0.017, 0.15); g.add(led);
  const pl = new THREE.PointLight('#80c0ff', 0.12, 0.35, 2); pl.position.set(0.6, BH + 0.06, 0.1); g.add(pl);
  g.userData.update = (t) => { ledM.color.setHSL((t * 0.08) % 1, 0.8, 0.6); pl.color.copy(ledM.color); };
  // fluorescent strip under the lid
  box(W - 0.2, 0.012, 0.03, new THREE.MeshBasicMaterial({ color: '#f4f8ff' }), 0, H - 0.02, -0.18, g);
  return g;
}
