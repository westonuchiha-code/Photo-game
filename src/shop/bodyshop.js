// The drive-in body shop: a spray booth you park in, and the menu that opens when you do.
//   makeBooth()  -> Group (opening faces -z); userData.colliders [[x0, x1, z0, z1]] (local), userData.pad [x0, x1, z0, z1]
//   makeShopMenu({ drive, makeCar, wallet, paid })  -> { open(car), close(), active }
// A car is its spec (carbody2.js makeCar options), so every job here is "build the same car again with one option
// changed" and swap it in under the driver (drive.refit). Parts are plain options shared by every car type, so a new
// part is one line in PARTS plus whatever makeCar does with the option.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const tex = (name, rx, ry) => { const t = new THREE.TextureLoader().load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
export function makeBooth() {
  const g = new THREE.Group(); g.name = 'body_shop'; const W = 2.5, D = 7.2, H = 3.3, T = 0.22;
  const brick = (rx, ry) => new THREE.MeshStandardMaterial({ map: tex('wall_red_brick', rx, ry), roughness: 0.9 }), steel = new THREE.MeshStandardMaterial({ color: '#2c3238', roughness: 0.5, metalness: 0.5 }), white = new THREE.MeshStandardMaterial({ color: '#d9dcd6', roughness: 0.6 });
  const box = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
  for (const s of [-1, 1]) { box(T, H, D, brick(3, 1.4), s * (W + T / 2), H / 2, D / 2); box(0.05, H - 0.3, D - 0.3, white, s * (W - 0.03), H / 2, D / 2); }   // side walls, painted white inside
  box(W * 2 + T * 2, H, T, brick(2.4, 1.4), 0, H / 2, D + T / 2); box(W * 2, H - 0.3, 0.05, white, 0, H / 2, D - 0.03);                                          // back wall
  box(W * 2 + T * 2 + 0.3, 0.16, D + T + 0.5, steel, 0, H + 0.08, D / 2 + 0.05);                                                                             // roof
  box(W * 2 + T * 2, 0.5, 0.3, steel, 0, H - 0.25, 0.05);                                                                                                    // lintel over the opening
  // strip lights along the ceiling, a drain grate, hazard stripes at the doorway
  const lit = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.0), toneMapped: false }); for (const x of [-1.4, 1.4]) box(0.16, 0.05, D - 1.6, lit, x, H - 0.03, D / 2);
  box(0.9, 0.02, 0.9, steel, 0, 0.012, D / 2);
  { const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x = c.getContext('2d'); x.fillStyle = '#e8c21a'; x.fillRect(0, 0, 256, 32); x.fillStyle = '#15171a'; for (let i = -32; i < 256; i += 32) { x.beginPath(); x.moveTo(i, 32); x.lineTo(i + 16, 32); x.lineTo(i + 48, 0); x.lineTo(i + 32, 0); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 0.35), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.02, 0.2); g.add(m); }
  // the sign over the door (made-up name), lit
  { const c = document.createElement('canvas'); c.width = 1024; c.height = 192; const x = c.getContext('2d'); const draw = () => { x.fillStyle = '#12161c'; x.fillRect(0, 0, 1024, 192); x.strokeStyle = '#e8c21a'; x.lineWidth = 8; x.strokeRect(8, 8, 1008, 176); x.fillStyle = '#f2ead0'; fitText(x, 'ELM AUTO BODY', 512, 82, 940, 96, F.heavy, { spacing: 4 }); x.fillStyle = '#e8c21a'; fitText(x, 'RESPRAY · REPAIR · PARTS · DRIVE IN', 512, 152, 900, 38, F.label, { spacing: 3 }); };
    draw(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(); t.needsUpdate = true; });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(W * 2 + 0.2, (W * 2 + 0.2) * 192 / 1024), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.65, roughness: 0.5 })); s.position.set(0, H + 0.68, -0.02); s.rotation.y = Math.PI; g.add(s); box(W * 2 + 0.4, 1.1, 0.12, steel, 0, H + 0.68, 0.06); }
  // paint drums and a compressor against the back wall
  for (const [x, c] of [[-1.9, '#b3242a'], [-1.4, '#1b3a78'], [1.85, '#e8c21a']]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 12), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.3 })); d.position.set(x, 0.35, D - 0.4); g.add(d); }
  g.userData.colliders = [[-W - T, -W, 0, D + T], [W, W + T, 0, D + T], [-W - T, W + T, D - 0.75, D + T]];
  g.userData.pad = [-W + 0.3, W - 0.3, 1.2, D - 1.0];
  return g;
}

// ---- the menu
export const PAINTS = [['Signal red', '#b3242a'], ['Midnight blue', '#1b3a78'], ['Racing green', '#1f4a2e'], ['Black', '#16171a'], ['Pearl white', '#e9e6dc'], ['Silver', '#9aa2aa'], ['Taxi yellow', '#f0c41c'], ['Orange', '#d8661c'], ['Mint', '#a8d6c6'], ['Plum', '#5a2a5e'], ['Sky', '#5a9ad6'], ['Hot pink', '#e0457e'], ['Bronze', '#8a5a2a'], ['Lime', '#8ac43a']];
// each part: [label, price, options to set, options that mean it is already fitted]
export const PARTS = {
  Wheels: [['Five-spoke alloys', 60, { rim: 'alloy' }], ['Six-spoke alloys', 70, { rim: 'six' }], ['Multi-spoke alloys', 90, { rim: 'multi' }], ['Steel wheels + hubcaps', 25, { rim: 'steel' }]],
  'Wheel colour': [['Silver', 15, { rimColor: undefined }], ['Black', 20, { rimColor: '#1c1d20' }], ['Gold', 30, { rimColor: '#b8923a' }], ['White', 20, { rimColor: '#e6e6e2' }], ['Red', 25, { rimColor: '#a8201e' }]],
  Spoiler: [['None', 0, { wing: false, roofSpoiler: false }], ['Boot wing', 50, { wing: true, roofSpoiler: false }], ['Body-colour wing', 65, { wing: true, wingMat: 'paint', roofSpoiler: false }], ['Roof spoiler', 45, { wing: false, roofSpoiler: true }]],
  Windows: [['Standard glass', 0, { tint: undefined }], ['Light glass', 20, { tint: 'light' }], ['Dark tint', 35, { tint: 'dark' }], ['Limo black', 50, { tint: 'limo' }]],
  Extras: [['Front lip', 25, { lip: true }], ['Fog lamps', 30, { fog: true }], ['Roof rails', 25, { rails: true }], ['Two-tone roof (white)', 40, { roofColor: '#f0eee8' }], ['Two-tone roof (black)', 40, { roofColor: '#141518' }], ['Strip the extras', 0, { lip: false, fog: false, rails: false, roofColor: undefined }]],
};
const CSS = `
#bshop { position: fixed; left: 0; right: 0; bottom: 0; height: 52%; max-height: 470px; z-index: 30; display: flex; flex-direction: column; background: linear-gradient(#14181df2, #0b0d10f7); border-top: 2px solid #e8c21a; color: #e6e2d6; font: 15px/1.35 system-ui, sans-serif; padding-bottom: env(safe-area-inset-bottom, 0px); touch-action: manipulation; -webkit-user-select: none; user-select: none; }
#bshop[hidden] { display: none; }
#bshop .hd { display: flex; align-items: baseline; gap: 10px; padding: 9px 14px 7px; border-bottom: 1px solid #3a4048; } #bshop .hd b { color: #e8c21a; font-size: 17px; letter-spacing: .5px; } #bshop .hd span { flex: 1; color: #9aa2aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } #bshop .hd i { font-style: normal; font-weight: 700; color: #e8c21a; }
#bshop .tabs { display: flex; gap: 6px; padding: 7px 10px; overflow-x: auto; } #bshop .tabs button { white-space: nowrap; }
#bshop button { font: 600 14px system-ui, sans-serif; color: #e6e2d6; background: #1d2228; border: 1px solid #3a4048; border-radius: 9px; padding: 9px 12px; }
#bshop button.on { border-color: #e8c21a; color: #e8c21a; } #bshop button:active { background: #2c333b; } #bshop button[disabled] { opacity: .4; }
#bshop .body { flex: 1; overflow-y: auto; padding: 4px 10px 8px; display: flex; flex-direction: column; gap: 6px; }
#bshop .body .row { display: flex; justify-content: space-between; align-items: center; text-align: left; } #bshop .row i { font-style: normal; color: #e8c21a; }
#bshop .sw { display: grid; grid-template-columns: repeat(7, 1fr); gap: 7px; } #bshop .sw button { height: 44px; padding: 0; border-width: 2px; }
#bshop .note { color: #9aa2aa; font-size: 13px; padding: 2px 2px 0; }
#bshop .ft { padding: 7px 10px 9px; border-top: 1px solid #3a4048; display: flex; } #bshop .ft button { flex: 1; color: #e8c21a; }
body[data-shop] #use, body[data-shop] #purse { display: none; }
@media (orientation: landscape) { #bshop { left: auto; width: 46%; height: 100%; max-height: none; border-top: 0; border-left: 2px solid #e8c21a; } }
`;

export function makeShopMenu({ drive, makeCar, wallet, paid = () => {}, resprayed = () => {} }) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = document.createElement('div'); el.id = 'bshop'; el.hidden = true; el.innerHTML = '<div class="hd"><b>ELM AUTO BODY</b><span></span><i></i></div><div class="tabs"></div><div class="body"></div><div class="ft"><button class="done">Drive out</button></div>'; document.body.appendChild(el);
  for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'wheel']) el.addEventListener(ev, (x) => x.stopPropagation());
  const $ = (q) => el.querySelector(q), body = $('.body'), tabsEl = $('.tabs'); let car = null, tab = 'Repair', ang = 0.6, room = null;
  const cash = () => { $('.hd i').textContent = '$' + wallet.money; $('.hd span').textContent = car ? car.userData.driveName : ''; };
  const repairCost = () => { const u = car.userData; return Math.round((1 - u.hp / u.hd.hpMax) * 120); };
  // build the same car with these options changed, and put it in place of the one in the booth
  function refit(change, repair = false) { const u = car.userData, hp = u.hp, opts = { ...u.opts, ...change }; for (const k of Object.keys(opts)) if (opts[k] === undefined || opts[k] === false) delete opts[k]; drive.refit(car, makeCar(opts)); car.userData.hp = repair ? car.userData.hd.hpMax : Math.min(hp, car.userData.hd.hpMax); }
  const fitted = (set) => { const o = car.userData.opts; return Object.keys(set).every((k) => (o[k] === undefined || o[k] === false ? undefined : o[k]) === (set[k] === false ? undefined : set[k])); };
  const charge = (p) => { if (wallet.money < p) return false; wallet.money -= p; paid(); return true; };
  function draw() { cash(); tabsEl.innerHTML = ''; for (const t of ['Repair', 'Paint', ...Object.keys(PARTS)]) { const b = document.createElement('button'); b.textContent = t; if (t === tab) b.className = 'on'; b.addEventListener('click', () => { tab = t; draw(); }); tabsEl.appendChild(b); }
    body.innerHTML = ''; const note = (s) => { const d = document.createElement('div'); d.className = 'note'; d.textContent = s; body.appendChild(d); };
    const row = (label, price, on, isOn) => { const b = document.createElement('button'); b.className = 'row' + (isOn ? ' on' : ''); b.innerHTML = `<span>${label}</span><i>${isOn ? 'fitted' : price ? '$' + price : 'free'}</i>`; b.disabled = !isOn && wallet.money < price; b.addEventListener('click', () => { if (isOn) return; on(); }); body.appendChild(b); };
    if (tab === 'Repair') { const c = repairCost(), u = car.userData; note(`Body and engine: ${Math.round(u.hp / u.hd.hpMax * 100)}%. Dents pulled, lamps replaced, everything put right.`); row('Full repair', c, () => { if (charge(c)) { refit({}, true); draw(); } }, c === 0 && !dented()); if (c === 0 && !dented()) note('Nothing needs doing.'); }
    else if (tab === 'Paint') { note('Any colour, $40. The whole car, door shuts and all.'); const sw = document.createElement('div'); sw.className = 'sw'; body.appendChild(sw); for (const [name, col] of PAINTS) { const b = document.createElement('button'); b.style.background = col; b.title = name; if ((car.userData.opts.color || '').toLowerCase() === col) b.className = 'on'; b.disabled = wallet.money < 40; b.addEventListener('click', () => { if ((car.userData.opts.color || '').toLowerCase() === col) return; if (charge(40)) { refit({ color: col, dust: undefined }); resprayed(); draw(); } }); sw.appendChild(b); }
      row('Metallic finish', 20, () => { if (charge(20)) { refit({ metal: 0.75 }); draw(); } }, car.userData.opts.metal === 0.75); row('Flat finish', 20, () => { if (charge(20)) { refit({ metal: 0.1 }); draw(); } }, car.userData.opts.metal === 0.1); }
    else for (const [label, price, set] of PARTS[tab]) row(label, price, () => { if (charge(price)) { refit(set); draw(); } }, fitted(set)); }
  const dented = () => !!car.userData.dented;
  $('.done').addEventListener('click', () => api.close());
  // the car shown off: the view circles slowly, low, at three-quarters
  const _t = new THREE.Vector3();
  const view = (camera, dt) => { ang += dt * 0.22; const u = car.userData, r = u.spec.L * 0.62 + 2.6, h = car.rotation.y + Math.PI + Math.sin(ang) * 0.75; camera.position.set(car.position.x + Math.sin(h) * r, car.position.y + 1.35 + Math.sin(ang * 0.7) * 0.2, car.position.z + Math.cos(h) * r); if (room) { camera.position.x = Math.min(room[1], Math.max(room[0], camera.position.x)); camera.position.z = Math.min(room[3], Math.max(room[2], camera.position.z)); }   /* (kept inside the booth and its apron, so no wall comes between) */ _t.set(car.position.x, car.position.y + u.spec.H * 0.45 - (innerHeight > innerWidth ? 1.15 : 0), car.position.z); camera.lookAt(_t); };   /* (upright screen: aim low, so the car sits above the menu) */
  const api = { active: false,
    open(c, where = null) { car = c; room = where; api.active = true; tab = car.userData.hp < car.userData.hd.hpMax ? 'Repair' : 'Paint'; drive.lock = true; drive.view = view; document.body.dataset.shop = '1'; el.hidden = false; draw(); },
    close() { if (!api.active) return; api.active = false; drive.lock = false; drive.view = null; delete document.body.dataset.shop; el.hidden = true; car = null; } };
  return api;
}
