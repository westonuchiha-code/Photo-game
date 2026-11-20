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
