// Driving, second system (the phone build's; the big town keeps src/drive.js). Third-person, arcade but physical, in
// the spirit of an early-2000s open-city game:
//   - each wheel pair has its own grip: the car turns in, pushes wide or steps its tail out because of what the front
//     and rear tyres are doing (load shifts under braking / power; power and the handbrake use up rear grip)
//   - every car type has its own handling (HANDLING): drive wheels, power, grip, steering, weight, how top-heavy it is
//   - cars have health: hits dent the bodywork and cost health; a hurt engine smokes, loses power, catches fire and
//     finally blows up, leaving a burnt wreck
//   - a top-heavy car cornered or tripped hard goes over: onto two wheels, its side or its roof, sliding and tumbling
//   - other cars are not fixed: a parked car that is hit is shoved along, spun and dented
//   - what the car does to people on the street is reported through `hooks` (see people96.js)
//   const drive = makeDriver2({ scene, camera, areas, colliders, ground, hooks })
//   drive.addCar(car, { name })  .nearest(pos)  .enter(car)  .exit() -> { x, z, yaw }  .update(dt) (every frame)
//   drive.active  .state (x, z, h, vx, vz ...)  .cars  .rebuild()  .adopt(car)  .sim(secs, input)
import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0), G = 9.81;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const tyre = (x) => Math.sin(1.35 * Math.atan(x));   // side force against slip: rises, peaks, falls away a little

// ---- how each kind of car drives. drive: which wheels are driven. launch: pull from rest (m/s2), fading to nothing at
// vtop (m/s). grip: sideways grip in g. rear: rear grip as a
// share of front (below 1 = tail-happy). steer: full lock (rad) and how fast lock fades with speed. cg: height of the
// centre of mass (m): with the track width it decides how easily the car goes over. tough: health multiplier.
const CLASS = {
  sports:  { drive: 'rwd', grip: 1.5, rear: 0.97, steer: 0.60, fade: 0.050, turnIn: 11.5, brake: 1.15, launch: 8.6, vtop: 62, cg: 0.46, tough: 0.9, yawDamp: 0.7, roll: 0.7, note: 1.25 },
  sedan:   { drive: 'rwd', grip: 1.3, rear: 1.02, steer: 0.56, fade: 0.058, turnIn: 8.5, brake: 1.0, launch: 6.2, vtop: 50, cg: 0.55, tough: 1.0, yawDamp: 1.0, roll: 1.25, note: 1.0 },
  hatch:   { drive: 'fwd', grip: 1.32, rear: 1.06, steer: 0.62, fade: 0.055, turnIn: 10.5, brake: 1.05, launch: 6.2, vtop: 46, cg: 0.54, tough: 0.85, yawDamp: 0.9, roll: 1.0, note: 1.15 },
  kei:     { drive: 'fwd', grip: 1.2, rear: 1.05, steer: 0.66, fade: 0.062, turnIn: 11.5, brake: 0.95, launch: 4.8, vtop: 36, cg: 0.62, tough: 0.65, yawDamp: 0.9, roll: 1.3, note: 1.5 },
  pickup:  { drive: 'rwd', grip: 1.12, rear: 0.9, steer: 0.52, fade: 0.062, turnIn: 6.5, brake: 0.9, launch: 5.6, vtop: 44, cg: 0.78, tough: 1.5, yawDamp: 1.0, roll: 1.5, note: 0.75 },
  offroad: { drive: 'awd', grip: 1.15, rear: 1.0, steer: 0.54, fade: 0.060, turnIn: 7.0, brake: 0.92, launch: 5.8, vtop: 40, cg: 0.82, tough: 1.4, yawDamp: 1.1, roll: 1.6, note: 0.8 },
  van:     { drive: 'rwd', grip: 1.08, rear: 1.0, steer: 0.52, fade: 0.066, turnIn: 6.0, brake: 0.85, launch: 4.4, vtop: 38, cg: 0.92, tough: 1.3, yawDamp: 1.2, roll: 1.8, note: 0.85 },
  truck:   { drive: 'rwd', grip: 1.0, rear: 0.95, steer: 0.48, fade: 0.070, turnIn: 5.0, brake: 0.8, launch: 3.6, vtop: 33, cg: 1.0, tough: 2.2, yawDamp: 1.3, roll: 1.7, note: 0.6 },
};
const TYPE_CLASS = { coupe: 'sports', keisport: 'sports', sedan: 'sedan', wagon: 'sedan', hatch: 'hatch', kei: 'kei', keiold: 'kei', pickup: 'pickup', scout: 'offroad', van: 'van', keivan: 'van', oldvan: 'van', keitruck: 'van', bigtruck: 'truck' };
export function handlingFor(type, spec) { const cls = TYPE_CLASS[type] || 'sedan', c = CLASS[cls], WB = spec.WB, a = WB * (c.drive === 'fwd' ? 0.42 : 0.47);
  return { ...c, cls, a, b: WB - a, track: spec.W * 0.84, mass: spec.mass, power: spec.power, vmax: c.vtop * (0.92 + Math.min(0.16, spec.power / 2000)), hpMax: Math.round(1000 * c.tough) }; }

export function makeDriver2({ scene, camera, areas, colliders, ground, hooks = {} }) {
  const cars = []; let car = null;   // `car`: the one being driven
  const keys = new Set();
  addEventListener('keydown', (e) => { keys.add(e.code); if (api.active && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  // ---- collider grid (8 m cells) so a car only tests what's nearby; rebuilt when the area changes
  const CELL = 8, grid = new Map(), cellKey = (i, j) => i * 100003 + j;
  const fileColliders = () => { grid.clear(); for (const c of colliders) { if (c.y0 !== undefined && c.y0 > 1.0) continue; const [x0, x1, z0, z1] = c.type === 'circle' ? [c.x - c.r, c.x + c.r, c.z - c.r, c.z + c.r] : [c.minX, c.maxX, c.minZ, c.maxZ]; if (x1 - x0 > 400 || z1 - z0 > 400) continue;
    for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) for (let j = Math.floor(z0 / CELL); j <= Math.floor(z1 / CELL); j++) { const k = cellKey(i, j); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(c); } } };
  fileColliders();
  const nearCols = (x, z) => { const out = new Set(), i0 = Math.floor(x / CELL), j0 = Math.floor(z / CELL); for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) { const l = grid.get(cellKey(i, j)); if (l) for (const c of l) out.add(c); } return out; };
  const inArea = (x, z) => areas.some((a) => a.y0 === undefined && x >= a.minX && x <= a.maxX && z >= a.minZ && z <= a.maxZ);
  const corners = (x, z, h, u) => { const s = Math.sin(h), c = Math.cos(h); return [[u.half.x, u.half.zF], [-u.half.x, u.half.zF], [u.half.x, u.half.zR], [-u.half.x, u.half.zR], [u.half.x, 0], [-u.half.x, 0]].map(([lx, lz]) => [x + lx * c + lz * s, z - lx * s + lz * c]); };

  // ---- HUD + touch controls. Touch: the left half of the screen is the steering (slide your thumb left / right from
  // where it lands: the further, the more lock); gas, brake and handbrake are on the right; drag the top of the screen to look round.
  const hud = document.createElement('div'); hud.id = 'drivehud';
  hud.innerHTML = `<div class="spd"><b>0</b><i>km/h</i></div><div class="hp"><i></i></div><div class="msg"></div>
    <div class="tip help-mouse"><b>W/S</b> gas / brake + reverse · <b>A/D</b> steer · <b>Space</b> handbrake · <b>E</b> get out · <b>H</b> horn (touch: both arrows) · hold <b>C</b> look back · gas + brake: burnout</div>
    <div class="dpad"><button data-k="left">&#9664;</button><button data-k="right">&#9654;</button></div>
    <div class="pads"><button data-k="out" class="y">Y<i>get out</i></button><button data-k="brake" class="x">X<i>brake / reverse</i></button><button data-k="hand" class="b">B<i>handbrake</i></button><button data-k="gas" class="a">A<i>accelerate</i></button></div>
    <button class="look">&#8635;</button>`;
  const css = document.createElement('style');
  css.textContent = `#drivehud{position:fixed;inset:0;pointer-events:none;display:none;font-family:system-ui,sans-serif;color:#fff;user-select:none;-webkit-user-select:none}
  body[data-mode=drive] #drivehud{display:block}
  #drivehud .spd{position:absolute;right:22px;bottom:calc(26px + env(safe-area-inset-bottom,0px));text-align:right;text-shadow:0 2px 6px #000a}
  #drivehud .spd b{font:800 46px/1 system-ui;letter-spacing:-1px;font-variant-numeric:tabular-nums} #drivehud .spd i{font-style:normal;opacity:.8;margin-left:4px}
  #drivehud .hp{position:absolute;right:22px;bottom:calc(84px + env(safe-area-inset-bottom,0px));width:130px;height:9px;border-radius:5px;background:#0008;overflow:hidden;border:1px solid #fff5}
  #drivehud .hp i{display:block;height:100%;width:100%;background:#5fd05a;transition:width .15s}
  #drivehud .msg{position:absolute;left:50%;top:22%;transform:translateX(-50%);font:800 30px system-ui;letter-spacing:.06em;text-shadow:0 3px 10px #000;opacity:0;transition:opacity .4s;white-space:nowrap}
  #drivehud .tip{position:absolute;left:50%;transform:translateX(-50%);top:64px;background:#0008;padding:8px 12px;border-radius:10px;font-size:13px;max-width:70vw}
  #drivehud .pads,#drivehud .dpad,#drivehud .look{display:none}
  @media (pointer:coarse){#drivehud .tip{display:none}
  #drivehud .pads{display:block;position:absolute;right:8px;bottom:calc(10px + env(safe-area-inset-bottom,0px));width:196px;height:196px}
  #drivehud .pads button,#drivehud .dpad button{pointer-events:auto;position:absolute;width:70px;height:70px;border-radius:50%;background:#000a;color:#fff;font:800 24px/1 system-ui;border:3px solid #fff6;touch-action:none;padding:0}
  #drivehud .pads button i{display:block;font:600 8.5px/1.1 system-ui;font-style:normal;opacity:.85;margin-top:2px;white-space:nowrap}
  #drivehud .pads .a{left:63px;top:126px;border-color:#5fd05a;color:#8be886} #drivehud .pads .b{left:126px;top:63px;border-color:#e0524a;color:#ff8a82}
  #drivehud .pads .x{left:0;top:63px;border-color:#4a8ae0;color:#8ab8ff} #drivehud .pads .y{left:63px;top:0;border-color:#e0c040;color:#ffe27a}
  #drivehud .pads button.on,#drivehud .dpad button.on{background:#fff5}
  #drivehud .dpad{display:block;position:absolute;left:10px;bottom:calc(52px + env(safe-area-inset-bottom,0px));width:180px;height:84px}
  #drivehud .dpad button{width:84px;height:84px;border-radius:18px;font-size:30px} #drivehud .dpad [data-k=right]{left:96px}
  #drivehud .look{display:block;position:absolute;left:12px;top:calc(12px + env(safe-area-inset-top,0px));pointer-events:auto;width:46px;height:46px;border-radius:50%;border:2px solid #fff5;background:#000a;color:#fff;font-size:22px}
  #drivehud .spd{right:auto;left:16px;text-align:left;bottom:calc(150px + env(safe-area-inset-bottom,0px))} #drivehud .hp{right:auto;left:16px;bottom:calc(206px + env(safe-area-inset-bottom,0px))}}`;
  document.head.appendChild(css); document.body.appendChild(hud);
  const touch = { steer: 0, gas: 0, brake: 0, hand: 0, left: 0, right: 0, horn: 0 }; let hornOn = false, anim = null;
  hud.querySelectorAll('.pads button, .dpad button').forEach((b) => { const k = b.dataset.k, on = (v) => (e) => { e.preventDefault(); b.classList.toggle('on', !!v); if (k === 'out') { if (v) document.getElementById('use')?.click(); return; } touch[k] = v; touch.horn = touch.left && touch.right ? 1 : 0; touch.steer = touch.horn ? 0 : touch.right - touch.left; };   // (both arrows at once: the horn, like clicking the stick)
    b.addEventListener('touchstart', on(1), { passive: false }); b.addEventListener('touchend', on(0)); b.addEventListener('touchcancel', on(0)); b.addEventListener('mousedown', on(1)); b.addEventListener('mouseup', on(0)); b.addEventListener('mouseleave', on(0)); });
  const spdEl = hud.querySelector('.spd b'), hpBar = hud.querySelector('.hp i'), msgEl = hud.querySelector('.msg'), lookBtn = hud.querySelector('.look');
  { const on = (v) => (e) => { S.camMode = v; e.preventDefault(); }; lookBtn.addEventListener('touchstart', on(1), { passive: false }); lookBtn.addEventListener('touchend', on(0)); lookBtn.addEventListener('touchcancel', on(0)); }
  // steering thumb + look drag (touches that don't land on a button)
  { const T = new Map(), dom = document.body;
    dom.addEventListener('touchstart', (e) => { if (!api.active || (e.target.closest && e.target.closest('button'))) return; for (const t of e.changedTouches) { const steer = false; T.set(t.identifier, { steer, x0: t.clientX, x: t.clientX, y: t.clientY }); } }, { passive: true });
    dom.addEventListener('touchmove', (e) => { if (!api.active) return; for (const t of e.changedTouches) { const s = T.get(t.identifier); if (!s) continue; { S.lookYaw -= (t.clientX - s.x) * 0.006; S.lookPitch = clamp(S.lookPitch + (t.clientY - s.y) * 0.004, -0.25, 0.5); S.lookT = 1.6; } s.x = t.clientX; s.y = t.clientY; } }, { passive: true });
    const end = (e) => { for (const t of e.changedTouches) { const s = T.get(t.identifier); T.delete(t.identifier); } }; dom.addEventListener('touchend', end); dom.addEventListener('touchcancel', end); }
  let msgT = 0; const say = (t, secs = 2.2) => { msgEl.textContent = t; msgEl.style.opacity = 1; msgT = secs; };

  // ---- sound: a two-oscillator engine through a filter, tyre noise, and noise bursts for knocks and bangs
  let au = null;
  function audio() { if (au) return au; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const ctx = new AC(), master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.connect(master);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square'; o1.connect(lp); const g2 = ctx.createGain(); g2.gain.value = 0.35; o2.connect(g2); g2.connect(lp); o1.start(); o2.start();
    const nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 3; const sq = ctx.createGain(); sq.gain.value = 0; ns.connect(bp); bp.connect(sq); sq.connect(ctx.destination); ns.start();
    const ns2 = ctx.createBufferSource(); ns2.buffer = nb; ns2.loop = true; const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 500; const bang = ctx.createGain(); bang.gain.value = 0; ns2.connect(lp2); lp2.connect(bang); bang.connect(ctx.destination); ns2.start();
    const horn = ctx.createGain(); horn.gain.value = 0; const hl = ctx.createBiquadFilter(); hl.type = 'lowpass'; hl.frequency.value = 2200; hl.connect(horn); horn.connect(ctx.destination); for (const f of [415, 523]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(hl); o.start(); }
    return (au = { ctx, master, lp, o1, o2, sq, bang, lp2, horn }); }
  const thud = (vol, freq = 500, len = 0.12) => { if (!au) return; const t = au.ctx.currentTime; au.lp2.frequency.setValueAtTime(freq, t); au.bang.gain.cancelScheduledValues(t); au.bang.gain.setValueAtTime(Math.min(0.5, vol), t); au.bang.gain.exponentialRampToValueAtTime(0.0008, t + len); };

  // ---- skid marks (dark strips under sliding rear tyres) and soft particles (smoke, fire, sparks, dust)
  const SK = 700, skGeo = new THREE.PlaneGeometry(0.22, 1); skGeo.rotateX(-Math.PI / 2);
  const skids = new THREE.InstancedMesh(skGeo, new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }), SK); skids.count = 0; skids.frustumCulled = false; scene.add(skids); let skI = 0;
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3(), lastSk = [null, null];
  function skid(i, x, z, y) { const l = lastSk[i]; lastSk[i] = [x, z]; if (!l) return; const dx = x - l[0], dz = z - l[1], len = Math.hypot(dx, dz); if (len < 0.02 || len > 4) return; _q.setFromAxisAngle(UP, Math.atan2(dx, dz)); _p.set((x + l[0]) / 2, y + 0.016, (z + l[1]) / 2); _s.set(1, 1, len + 0.05); _m.compose(_p, _q, _s); skids.setMatrixAt(skI % SK, _m); skI++; skids.count = Math.min(SK, skI); skids.instanceMatrix.needsUpdate = true; }
  const puffT = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const NP = 90, parts = []; for (let i = 0; i < NP; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, depthWrite: false, transparent: true })); s.visible = false; scene.add(s); parts.push({ s, life: 0, max: 1, v: new THREE.Vector3(), grow: 0, size: 1, a: 1 }); }
  let pI = 0;
  function puff(x, y, z, { color = '#888', size = 0.5, grow = 1.2, life = 1.2, vy = 1.2, spread = 0.4, glow = false, a = 0.6, vx = 0, vz = 0 } = {}) { const o = parts[pI]; pI = (pI + 1) % NP; o.s.position.set(x, y, z); o.s.material.color.set(color); o.s.material.blending = glow ? THREE.AdditiveBlending : THREE.NormalBlending; o.s.visible = true; o.life = o.max = life * (0.8 + Math.random() * 0.4); o.v.set(vx + (Math.random() - 0.5) * spread, vy, vz + (Math.random() - 0.5) * spread); o.grow = grow; o.size = size; o.a = a; o.s.scale.setScalar(size); }
  function tickParts(dt) { for (const o of parts) if (o.s.visible) { o.life -= dt; if (o.life <= 0) { o.s.visible = false; continue; } const t = 1 - o.life / o.max; o.s.position.addScaledVector(o.v, dt); o.s.scale.setScalar(o.size + o.grow * t); o.s.material.opacity = o.a * (1 - t) * Math.min(1, t * 8); } }

  // ---- the driven car's state. mode: 'wheels' (driving), 'tumble' (going over / sliding on its side or roof)
  const S = { x: 0, z: 0, h: 0, vx: 0, vz: 0, r: 0, steer: 0, y: 0, roll: 0, rollV: 0, pitch: 0, pitchV: 0, air: false, vy: 0, vyG: 0, lastG: 0,
    mode: 'wheels', phi: 0, phiV: 0, tipT: 0, stuckT: 0, slip: 0, slipF: 0, spinR: 0, drift: 0, spin: 0, aLong: 0, aLat: 0, vF: 0,
    camH: 0, camD: 6.4, camMode: 0, lookYaw: 0, lookPitch: 0, lookT: 0, shake: 0, boost: 0 };

  // ---- damage. A hit costs health by its speed and crushes the bodywork round the point of contact.
  const WRECK = new THREE.MeshStandardMaterial({ color: '#141312', roughness: 0.95, metalness: 0.2 });
  function dent(g, lx, ly, lz, depth, rad) {   // body-local point; panels near it are pushed in toward the car's middle
    const body = g.userData.body; if (!body) return; body.updateMatrixWorld(true);
    body.traverse((m) => { if (!m.isMesh || !m.geometry || m.isInstancedMesh) return; const p = m.geometry.attributes.position; if (!p || p.count > 60000) return; let hit = false; const inv = m.matrix; void inv;
      const e = m.matrixWorld.elements, b = body.matrixWorld.elements; void e; void b;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i) + m.position.x, y = p.getY(i) + m.position.y, z = p.getZ(i) + m.position.z, dx = x - lx, dy = y - ly, dz = z - lz, d2 = dx * dx + dy * dy + dz * dz; if (d2 > rad * rad) continue;
        const k = depth * (1 - Math.sqrt(d2) / rad) ** 1.5, cx = -x, cz = (g.userData.half.zF + g.userData.half.zR) / 2 - z, cl = Math.hypot(cx, cz) || 1, j = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        p.setXYZ(i, p.getX(i) + cx / cl * k * (0.8 + 0.4 * j), p.getY(i) - k * 0.18 * (y > 0.9 ? 1 : -0.3), p.getZ(i) + cz / cl * k * (0.8 + 0.4 * j)); hit = true; }
      if (hit) { p.needsUpdate = true; m.geometry.computeVertexNormals(); } }); }
  function hurt(g, amount, wx, wz, wy = 0.6) {   // world point of contact
    const u = g.userData; if (u.wreck) return; u.hp = Math.max(0, u.hp - amount);
    if (amount > 25) { const s = Math.sin(g.rotation.y), c = Math.cos(g.rotation.y), dx = wx - g.position.x, dz = wz - g.position.z; dent(g, dx * c - dz * s, wy, dx * s + dz * c, clamp(amount / 900, 0.03, 0.3), clamp(0.5 + amount / 500, 0.6, 1.5)); }
    if (amount > 140 && u.lamps) { const front = (wx - g.position.x) * Math.sin(g.rotation.y) + (wz - g.position.z) * Math.cos(g.rotation.y) > 0; for (const l of front ? u.lamps.head : u.lamps.tail) { if (!l.userData.own) { l.material = l.material.clone(); l.userData.own = true; } l.material.emissiveIntensity = 0; l.material.color.multiplyScalar(0.3); l.userData.dead = true; } }
    if (u.hp <= 0) explode(g); }
  function explode(g) { const u = g.userData; if (u.wreck) return; u.wreck = true; u.hp = 0; u.fire = 0; const x = g.position.x, y = g.position.y, z = g.position.z;
    for (let i = 0; i < 16; i++) puff(x + (Math.random() - 0.5) * 2, y + 0.6 + Math.random() * 1.2, z + (Math.random() - 0.5) * 2, { color: i % 3 ? '#ff9a2a' : '#ffe08a', size: 1.2, grow: 3.5, life: 0.7, vy: 2.5, spread: 5, glow: true, a: 0.9 });
    for (let i = 0; i < 12; i++) puff(x + (Math.random() - 0.5) * 2, y + 1 + Math.random(), z + (Math.random() - 0.5) * 2, { color: '#1a1a1a', size: 1.4, grow: 4, life: 3, vy: 2.2, spread: 2, a: 0.75 });
    g.traverse((m) => { if (m.isMesh) m.material = WRECK; }); dent(g, 0, 1.2, 0, 0.22, 2.4); thud(0.5, 220, 0.9);
    const d = dyn(g); d.vy = 4.5; d.w += (Math.random() - 0.5) * 3; d.vx += (Math.random() - 0.5) * 2; d.vz += (Math.random() - 0.5) * 2;
    for (const o of cars) if (o !== g) { const dd = Math.hypot(o.position.x - x, o.position.z - z); if (dd < 9) { const k = (1 - dd / 9), od = dyn(o); od.vx += (o.position.x - x) / (dd || 1) * 9 * k; od.vz += (o.position.z - z) / (dd || 1) * 9 * k; od.w += (Math.random() - 0.5) * 2 * k; hurt(o, 420 * k, x, z); } }
    if (hooks.blast) hooks.blast(x, z, 11);
    if (g === car) { S.shake = 1; say('WRECKED', 3); S.vx *= 0.3; S.vz *= 0.3; if (hooks.wrecked) setTimeout(() => hooks.wrecked(), 900); } else if (car && Math.hypot(S.x - x, S.z - z) < 30) S.shake = Math.max(S.shake, 0.6); }

  // ---- cars that are not being driven still move: shoved by a hit, rolling on after you bail out, blown about
  const dyn = (g) => g.userData.dyn || (g.userData.dyn = { vx: 0, vz: 0, w: 0, vy: 0, y: 0 });
  function tickOthers(dt) { for (const g of cars) { const u = g.userData;
      // a hurt engine: white smoke, then dark, then fire that eats the rest of the health
      if (!u.wreck && u.hp < u.hd.hpMax * 0.62 && (u.smokeT = (u.smokeT || 0) - dt) <= 0) { const f = u.hp / u.hd.hpMax, s = Math.sin(g.rotation.y), c = Math.cos(g.rotation.y), zz = u.half.zF * 0.72, bx = g.position.x + zz * s, bz = g.position.z + zz * c, by = g.position.y + (u.spec.hood || 0.9) + 0.05;
        u.smokeT = f < 0.2 ? 0.05 : f < 0.4 ? 0.09 : 0.16; puff(bx, by, bz, { color: f < 0.2 ? '#151515' : f < 0.4 ? '#4a4a4a' : '#c8c8c8', size: 0.35, grow: f < 0.2 ? 2.2 : 1.4, life: f < 0.2 ? 2.2 : 1.4, vy: 1.6, a: f < 0.4 ? 0.6 : 0.35 });
        if (f < 0.1) { puff(bx + (Math.random() - 0.5) * 0.5, by, bz + (Math.random() - 0.5) * 0.5, { color: '#ff8a1a', size: 0.5, grow: 0.9, life: 0.45, vy: 2.4, glow: true, a: 0.9 }); } }
      if (!u.wreck && u.hp < u.hd.hpMax * 0.1) { u.hp -= dt * u.hd.hpMax * 0.018; if (g === car && !u.warned) { u.warned = true; say('ON FIRE — GET OUT', 4); } if (u.hp <= 0) explode(g); }
      if (u.wreck && (u.fire = (u.fire || 0) + dt) < 14 && (u.smokeT = (u.smokeT || 0) - dt) <= 0) { u.smokeT = 0.12; puff(g.position.x, g.position.y + 1.1, g.position.z, { color: '#111', size: 0.6, grow: 2.6, life: 2.6, vy: 1.8, a: 0.6 }); if (u.fire < 7) puff(g.position.x + (Math.random() - 0.5), g.position.y + 0.9, g.position.z + (Math.random() - 0.5), { color: '#ff7a1a', size: 0.6, grow: 1, life: 0.5, vy: 2.2, glow: true, a: 0.8 }); }
      if (g === car) continue; const d = u.dyn; if (!d) continue; const sp = Math.hypot(d.vx, d.vz);
      if (sp < 0.05 && Math.abs(d.w) < 0.02 && d.y <= 0 && d.vy <= 0) { d.vx = d.vz = d.w = 0; continue; }
      const ox = g.position.x, oz = g.position.z; g.position.x += d.vx * dt; g.position.z += d.vz * dt; g.rotation.y += d.w * dt;
      if (d.y > 0 || d.vy > 0) { d.vy -= 14 * dt; d.y = Math.max(0, d.y + d.vy * dt); g.position.y = ground(g.position.x, g.position.z) + d.y; if (d.y === 0) d.vy = 0; }
      // stopped by walls and by the edge of the road; scrubbed by its tyres (sideways much more than along)
      let blocked = !corners(g.position.x, g.position.z, g.rotation.y, u).every(([a, b]) => inArea(a, b)); const W = u.half.x * 0.95, s = Math.sin(g.rotation.y), c = Math.cos(g.rotation.y);
      if (!blocked) for (const lz of [u.half.zF - W, (u.half.zF + u.half.zR) / 2, u.half.zR + W]) { const px = g.position.x + lz * s, pz = g.position.z + lz * c; for (const col of nearCols(px, pz)) { if (col.active === false || col.car === g || col.car === car) continue; const [nx, nz, pen] = overlap(px, pz, W, col); if (pen > 0) { if (col.car) { const od = dyn(col.car); od.vx += d.vx * 0.5; od.vz += d.vz * 0.5; } if (sp > 4) hurt(g, sp * sp * 0.5, px - nx * W, pz - nz * W); blocked = true; break; } } if (blocked) break; }
      if (blocked) { g.position.x = ox; g.position.z = oz; d.vx *= -0.25; d.vz *= -0.25; d.w *= 0.4; }
      const fwd = d.vx * s + d.vz * c, lat = d.vx * c - d.vz * s, nf = fwd * Math.exp(-(u.wreck ? 2.2 : 0.9) * dt), nl = lat * Math.exp(-4.5 * dt); d.vx = nf * s + nl * c; d.vz = nf * c - nl * s; d.w *= Math.exp(-2.6 * dt);
      api.syncCols(g); } }
  // overlap of a circle (centre px,pz radius W) with a collider -> [normal x, normal z, depth] (depth <= 0: none)
  function overlap(px, pz, W, col) { let nx, nz, d, m; if (col.type === 'circle') { nx = px - col.x; nz = pz - col.z; d = Math.hypot(nx, nz); m = col.r + W; } else { const cx = clamp(px, col.minX, col.maxX), cz = clamp(pz, col.minZ, col.maxZ); nx = px - cx; nz = pz - cz; d = Math.hypot(nx, nz); m = W; if (d < 1e-5) { nx = 0; nz = 1; d = 0; } } if (d >= m) return [0, 0, 0]; if (d > 1e-5) { nx /= d; nz /= d; } return [nx, nz, m - d]; }

  // push the driven car (3 circles along its length) out of what it overlaps; report the deepest contact
  function collide() { const u = car.userData, W = u.half.x * 0.98, s = Math.sin(S.h), c = Math.cos(S.h); let hit = null;
    for (const lz of [u.half.zF - W, (u.half.zF + u.half.zR) / 2, u.half.zR + W]) { const px = S.x + lz * s, pz = S.z + lz * c;
      for (const col of nearCols(px, pz)) { if (col.active === false || col.car === car) continue; const [nx, nz, pen] = overlap(px, pz, W, col); if (pen > 0) { S.x += nx * pen; S.z += nz * pen; if (!hit || pen > hit.pen) hit = { nx, nz, pen, col, px: px - nx * W, pz: pz - nz * W, lz }; } } }
    return hit; }
  function bump(hit) { const { nx, nz, col } = hit, vn = S.vx * nx + S.vz * nz; if (vn >= 0) return; const imp = -vn, u = car.userData, hd = u.hd;
    let e = 0.22, keep = 0.86;
    if (col && col.car) {   // another car: it takes part of the blow and moves off; the lighter car comes off worse
      const o = col.car, od = dyn(o), mr = hd.mass / (hd.mass + o.userData.hd.mass); od.vx -= nx * imp * mr * 1.5; od.vz -= nz * imp * mr * 1.5; od.w += ((hit.px - o.position.x) * -nz - (hit.pz - o.position.z) * -nx) * imp * mr * 0.35;
      if (imp > 2) hurt(o, imp * imp * 0.7 * mr, hit.px, hit.pz); e = 0.05; keep = 0.55 + 0.4 * mr; }
    S.vx -= (1 + e) * vn * nx; S.vz -= (1 + e) * vn * nz; S.vx *= keep; S.vz *= keep;
    // an off-centre blow spins the car; a hard sideways one can tip a top-heavy car
    const sh = Math.sin(S.h), ch = Math.cos(S.h), side = nx * ch - nz * sh; S.r += hit.lz * side * imp * 0.05;
    if (imp > 2) { hurt(car, imp * imp * (col && col.car ? 0.3 : 0.38), hit.px, hit.pz); S.shake = Math.min(1, S.shake + imp * 0.07); thud(Math.min(0.4, imp * 0.03), 380 + Math.random() * 200, 0.18); for (let i = 0; i < Math.min(5, imp * 0.4); i++) puff(hit.px, S.y + 0.5, hit.pz, { color: '#ffd28a', size: 0.12, grow: 0.1, life: 0.3, vy: 2, spread: 5, glow: true, a: 0.9 }); }
    if (S.mode === 'wheels' && Math.abs(side) > 0.7 && imp > 7.5 * (0.8 / hd.cg) * 0.8) tip(-Math.sign(side) * clamp(imp * 0.22, 1.2, 4)); }
  function tip(v) { if (S.mode !== 'wheels') return; S.mode = 'tumble'; S.phi = S.roll; S.phiV = v; S.tipT = 0; S.stuckT = 0; }

  function input() { if (api.force) return { gas: 0, brake: 0, steer: 0, hand: false, ...api.force }; if (anim) return { gas: 0, brake: 0, steer: 0, hand: true };
    const a = (...c) => c.some((q) => keys.has(q));
    return { gas: Math.max(a('KeyW', 'ArrowUp') ? 1 : 0, touch.gas), brake: Math.max(a('KeyS', 'ArrowDown') ? 1 : 0, touch.brake), steer: clamp((a('KeyA', 'ArrowLeft') ? 1 : 0) - (a('KeyD', 'ArrowRight') ? 1 : 0) - touch.steer, -1, 1), hand: a('Space', 'ShiftLeft', 'ShiftRight') || !!touch.hand }; }

  function step(dt, inp) {
    const u = car.userData, hd = u.hd, m = hd.mass; let sh = Math.sin(S.h), ch = Math.cos(S.h);
    let vF = S.vx * sh + S.vz * ch, vL = S.vx * ch - S.vz * sh; const spd = Math.hypot(S.vx, S.vz);
    const hpF = u.hp / hd.hpMax, pw = u.wreck ? 0 : hpF < 0.2 ? 0.5 : hpF < 0.4 ? 0.75 : 1;   // a hurt engine pulls less
    if (S.mode === 'tumble') {
      // off its wheels: it slides on its bodywork and rolls as a box. Its centre of mass rises over each edge, so it
      // rocks back or carries on over, losing energy at every edge it lands on.
      const hw = u.half.x, H = u.spec.H, cg = hd.cg, lift = (p) => hw * Math.abs(Math.sin(p)) - Math.min(0, H * Math.cos(p)), yc = (p) => lift(p) + cg * Math.cos(p);
      const dU = (yc(S.phi + 0.02) - yc(S.phi - 0.02)) / 0.04, I = (hw * hw + cg * cg) * 1.3; S.phiV += (-G * dU / I) * dt;
      const edge0 = Math.floor((S.phi + Math.PI / 4) / (Math.PI / 2)); S.phi += S.phiV * dt; const edge1 = Math.floor((S.phi + Math.PI / 4) / (Math.PI / 2));
      S.phiV *= Math.exp(-0.9 * dt); if (edge0 !== edge1) { const hitV = Math.abs(S.phiV); S.phiV *= 0.6; if (hitV > 1) { hurt(car, hitV * hitV * 9, S.x, S.z, 1.2); thud(Math.min(0.35, hitV * 0.06), 300, 0.2); S.shake = Math.min(1, S.shake + hitV * 0.12); } }
      // the sideways slide that tipped it keeps it rolling while it lasts
      S.phiV += -vL * 0.9 * dt * Math.abs(Math.cos(S.phi)) * (spd > 3 ? 1 : 0);
      const fr = Math.exp(-(0.55 * G / Math.max(2, spd)) * dt); S.vx *= fr; S.vz *= fr; S.r *= Math.exp(-1.6 * dt); S.h += S.r * dt; S.steer = damp(S.steer, 0, 6, dt);
      if (spd > 4 && Math.random() < dt * 30) puff(S.x + (Math.random() - 0.5), S.y + 0.2, S.z + (Math.random() - 0.5), { color: '#ffd28a', size: 0.1, grow: 0.1, life: 0.25, vy: 1.5, spread: 3, glow: true, a: 0.9 });
      // settled? on its wheels again it drives on. There is no putting a car back: on its roof it catches fire at once and
      // burns down; left on its side it does the same after a few seconds.
      const rest = wrapA(S.phi), near = Math.round(rest / (Math.PI / 2)) * (Math.PI / 2);
      if (Math.abs(S.phiV) < 0.5 && Math.abs(rest - near) < 0.12 && spd < 6) { if (Math.abs(wrapA(near)) < 0.01) { S.mode = 'wheels'; S.phi = 0; S.phiV = 0; S.roll = 0; S.rollV = 0; } else { S.phi = near; S.phiV = 0; S.stuckT += dt; if (S.stuckT > (Math.abs(Math.abs(wrapA(near)) - Math.PI) < 0.1 ? 0.6 : 4) && !u.wreck) u.hp = Math.min(u.hp, hd.hpMax * 0.099); } }
      S.aLong = 0; S.aLat = 0; S.slip = 0; S.drift = 0;
    } else if (S.air) {
      S.r = damp(S.r, inp.steer * 0.8, 2, dt); S.h += S.r * dt; S.steer = damp(S.steer, inp.steer * 0.3, 4, dt); const k = 1 - 0.004 * spd * dt; S.vx *= k; S.vz *= k; S.aLong = 0; S.aLat = 0; S.slip = 0; S.drift = 0;
    } else {
      // steering: lock fades with speed, and builds at the rate this car turns in
      const lock = hd.steer / (1 + spd * hd.fade); S.steer = damp(S.steer, inp.steer * lock, inp.steer ? hd.turnIn : hd.turnIn * 1.6, dt);
      // load on each axle (as a share of the weight): braking throws it forward, power throws it back
      const WB = hd.a + hd.b, wt = clamp(S.aLong * hd.cg / (WB * G), -0.3, 0.3), Nf = hd.b / WB - wt, Nr = hd.a / WB + wt;
      // what the driver asks of the tyres along the car
      const eng = hd.launch * pw * (1 - clamp(Math.abs(vF) / hd.vmax, 0, 1) ** 1.7);
      let drv = 0, brk = 0; const dir = vF >= 0 ? 1 : -1;
      // gas and brake held together from a crawl: the brakes hold the undriven wheels and the driven ones spin (1 rear, 2 front)
      const burn = inp.gas > 0.5 && inp.brake > 0.5 && Math.abs(vF) < 5 && hd.drive !== 'awd' && pw > 0 && !inp.hand ? (hd.drive === 'fwd' ? 2 : 1) : 0; S.burn = burn;
      if (burn) { /* handled below */ } else if (inp.gas) { if (vF < -0.6) brk = hd.brake * G * inp.gas; else drv = eng * inp.gas; }
      if (!burn && inp.brake) { if (vF > 0.6) brk = hd.brake * G * inp.brake; else drv = -Math.min(4.2, eng) * inp.brake * (vF > -9 ? 1 : 0); }
      const fShare = hd.drive === 'fwd' ? 1 : hd.drive === 'awd' ? 0.42 : 0;
      let axF = drv * fShare - brk * 0.64 * dir, axR = drv * (1 - fShare) - brk * 0.36 * dir;
      const hand = inp.hand && Math.abs(vF) > 0.3; if (hand) axR = -dir * 0.95 * G * Nr;   // the handbrake locks the rear wheels
      // each axle has so much grip (its load times the tyres' grip); what is used along the car is not there across it
      const capF = hd.grip * G * Nf, capR = hd.grip * hd.rear * G * Nr * (hand ? 0.55 : 1);
      const spinR = Math.abs(axR) > capR && !hand ? 1 : 0; axF = clamp(axF, -capF, capF); axR = clamp(axR, -capR, capR);
      const latF = Math.sqrt(Math.max(0.04 * capF * capF, capF * capF - axF * axF)), latR = Math.sqrt(Math.max((hand ? 0.1 : 0.05) * capR * capR, capR * capR - axR * axR)) * (spinR ? 0.8 : 1);
      const drag = 0.0042 * vF * Math.abs(vF) + (Math.abs(vF) > 0.05 ? dir * 0.22 : 0);
      if (burn) {
        // rear-drive: the tail hangs on spinning tyres and swings round the held front wheels as you steer. Front-drive: it just sits and smokes.
        vF = damp(vF, burn === 1 ? 0.5 : 0, 4, dt);
        if (burn === 1) { S.r = damp(S.r, clamp(inp.steer, -1, 1) * 2.1, 2.2, dt); vL = damp(vL, -hd.a * S.r, 10, dt); S.steer = damp(S.steer, inp.steer * hd.steer, hd.turnIn, dt); } else { S.r = damp(S.r, 0, 6, dt); vL *= Math.exp(-9 * dt); }
        S.aLong = burn === 1 ? 0.22 * G : -0.12 * G; S.aLat = 0; S.slip = burn === 1 ? 0.5 : 0; S.slipF = 0; S.drift = 0; S.spinR = burn === 1 ? 1 : 0; S.tipT = 0; S.shake = Math.max(S.shake, 0.05);
      } else if (Math.abs(vF) > 2.6) {
        // slip angles: how far each axle's tyres are pointing away from where they are going
        const sF = Math.sign(vF), aF = Math.atan2(vL + hd.a * S.r, Math.abs(vF)) - S.steer * sF, aR = Math.atan2(vL - hd.b * S.r, Math.abs(vF));
        const fF = -latF * tyre(aF * 9.5), fR = -latR * tyre(aR * (hand ? 6 : 10.5)), cs = Math.cos(S.steer);
        // a steadying hand: yaw is damped a little (more in a calm car), and catching a slide with opposite lock works well
        const sliding = clamp((Math.abs(aR) - 0.08) / 0.22, 0, 1), catching = sliding * (Math.sign(S.steer * sF) === Math.sign(aR) ? 1 : 0);
        const rDot = (hd.a * fF * cs * (1 + 0.5 * catching) - hd.b * fR) / (hd.a * hd.b * 0.8) - S.r * (hd.yawDamp * (1 - 0.6 * sliding) + (Math.abs(aR) > 0.6 ? 1.6 : 0));   // (the last term: a slide past about 35 degrees is reined in, so a drift can be held instead of always spinning)
        const vLDot = fF * cs + fR - vF * S.r, vFDot = axF * cs + axR - drag + vL * S.r - fF * Math.sin(S.steer) * sF * 0.5;
        S.r += rDot * dt; vL += vLDot * dt; vF += vFDot * dt; S.aLong = axF + axR - drag; S.aLat = fF * cs + fR;
        S.slip = Math.abs(aR); S.slipF = Math.abs(aF); S.drift = sliding > 0.5 && Math.abs(vF) > 6 ? 1 : 0; S.spinR = spinR || (hand ? 1 : 0);
        // going over: sideways force at the tyres against the height of the weight (two wheels lift when the ratio passes 1)
        const ri = Math.abs(S.aLat) * hd.cg / (G * hd.track / 2); S.tipT = ri > 1.25 && Math.abs(vF) > 13 ? S.tipT + dt : Math.max(0, S.tipT - dt * 2); if (S.tipT > 0.3) tip(Math.sign(S.aLat) * -1.0 * clamp(ri * 1.4, 1.3, 2.6));
      } else {   // walking pace: the car simply follows its front wheels
        S.r = damp(S.r, (vF * Math.tan(S.steer)) / WB, 12, dt); vL *= Math.exp(-9 * dt); vF += (axF + axR - drag) * dt; if (!inp.gas && !inp.brake && Math.abs(vF) < 0.4) vF *= 0.9; if (hand && Math.abs(vF) < 0.6) vF = 0;
        S.aLong = axF + axR - drag; S.aLat = vF * S.r; S.slip = 0; S.slipF = 0; S.drift = 0; S.spinR = spinR; S.tipT = 0;
      }
      S.h += S.r * dt; sh = Math.sin(S.h); ch = Math.cos(S.h); S.vx = vF * sh + vL * ch; S.vz = vF * ch - vL * sh;
    }
    S.vF = vF;
    // move, then deal with what was hit
    const ox = S.x, oz = S.z; S.x += S.vx * dt; S.z += S.vz * dt;
    const hit = collide(); if (hit) bump(hit);
    const dirS = Math.sign(S.vx * Math.sin(S.h) + S.vz * Math.cos(S.h)) || 1, zB = dirS > 0 ? u.half.zF : u.half.zR, fxS = Math.sin(S.h), fzS = Math.cos(S.h);
    if (!S.air && ground(S.x + fxS * (zB + dirS * 0.4), S.z + fzS * (zB + dirS * 0.4)) - ground(S.x + fxS * zB * 0.9, S.z + fzS * zB * 0.9) > 0.25) { S.x = ox; S.z = oz; const v = Math.hypot(S.vx, S.vz) || 1; bump({ nx: -S.vx / v, nz: -S.vz / v, pen: 0.1, px: S.x + fxS * zB, pz: S.z + fzS * zB, lz: zB }); }
    // the edge of the drivable ground is a wall too
    const ok = (x, z) => corners(x, z, S.h, u).every(([a, b]) => inArea(a, b));
    if (!ok(S.x, S.z) && ok(ox, oz)) { const edge = (nx, nz) => bump({ nx, nz, pen: 0.1, px: S.x - nx * u.half.x, pz: S.z - nz * u.half.x, lz: 0 });
      if (ok(S.x, oz)) { S.z = oz; edge(0, -Math.sign(S.vz)); } else if (ok(ox, S.z)) { S.x = ox; edge(-Math.sign(S.vx), 0); } else { S.x = ox; S.z = oz; S.h -= S.r * dt; const v = Math.hypot(S.vx, S.vz) || 1; edge(-S.vx / v, -S.vz / v); S.r *= -0.3; } }
  }

  function pose(dt) {
    const u = car.userData, hd = u.hd, s = Math.sin(S.h), c = Math.cos(S.h);
    const gh = u.wheels.map((w) => { const p = w.pivot.position; return ground(S.x + p.x * c + p.z * s, S.z - p.x * s + p.z * c); });
    const yF = (gh[0] + gh[1]) / 2, yR = (gh[2] + gh[3]) / 2, yLft = (gh[1] + gh[3]) / 2, yRgt = (gh[0] + gh[2]) / 2, yT = (yF + yR) / 2;
    if (S.air) { S.vy -= G * 1.35 * dt; S.y += S.vy * dt; if (S.y <= yT) { if (S.vy < -3) { S.shake = Math.min(1, -S.vy * 0.07); S.pitchV -= S.vy * 0.25; thud(Math.min(0.3, -S.vy * 0.03), 260, 0.2); if (S.vy < -7) hurt(car, S.vy * S.vy * 2.5, S.x, S.z, 0.3); } S.y = yT; S.air = false; S.vy = 0; S.vyG = 0; } }
    else { if (yT < S.y - 0.12 && S.vyG > 1.2) { S.air = true; S.vy = S.vyG * 1.05; } else { S.vyG = damp(S.vyG, clamp((yT - S.lastG) / Math.max(dt, 1e-3), -20, 20), 20, dt); S.y = damp(S.y, yT, 18, dt); } }
    S.lastG = yT;
    if (headLight) headLight.visible = !S.air && S.mode === 'wheels' && !car.userData.lamps.head[0].userData.dead;   // (smashed lamps throw no light)
    const spdH = Math.hypot(S.vx, S.vz), tp = S.air ? -Math.atan2(S.vy, Math.max(6, spdH)) * 0.8 : Math.atan2(yR - yF, u.axF - u.axR), tr = S.air ? 0 : Math.atan2(yLft - yRgt, 2 * Math.abs(u.wheels[0].pivot.position.x));
    // the body on its springs: it pitches under braking / power and leans in corners, more in a soft or tall car
    const k = 60, dd = 9, pT = clamp(-S.aLong * 0.0065 * hd.roll, -0.07, 0.07), rT = clamp(S.aLat * 0.0075 * hd.roll, -0.12, 0.12);
    S.pitchV += (k * (pT - S.pitch) - dd * S.pitchV) * dt; S.pitch += S.pitchV * dt; S.rollV += (k * (rT - S.roll) - dd * S.rollV) * dt; S.roll += S.rollV * dt;
    if (S.mode === 'tumble') { const hw = u.half.x, H = u.spec.H, lift = hw * Math.abs(Math.sin(S.phi)) - Math.min(0, H * Math.cos(S.phi)); car.position.set(S.x, S.y + lift, S.z); car.rotation.set(0, S.h, S.phi, 'YXZ'); u.body.rotation.set(0, 0, 0); u.body.position.y = 0; }
    else { car.position.set(S.x, S.y, S.z); car.rotation.set(0, S.h, 0, 'YXZ'); u.body.rotation.set(tp + S.pitch, 0, tr + S.roll, 'YXZ'); u.body.position.y = -Math.abs(S.roll) * 0.2; }
    // wheels: the fronts steer; all turn with the road, the driven rears faster when they are spinning, not at all when locked
    const hand = input().hand; S.spin += (S.vF / u.spec.R) * dt; S.spinExtra = (S.spinExtra || 0) + (S.spinR && !hand ? 22 : 0) * dt; S.spinFx = (S.spinFx || 0) + (S.burn === 2 ? 22 : 0) * dt;
    u.wheels.forEach((w, i) => { if (!w.knocked) w.pivot.rotation.y = w.front ? S.steer : 0; if (!(hand && !w.front)) w.spin.rotation.x = S.spin + (w.front ? S.spinFx : S.spinExtra); w.pivot.position.y = u.axY + (w.yOff || 0) + (S.air || S.mode === 'tumble' ? -0.09 : clamp(gh[i] - S.y, -0.08, 0.12)); });
    const braking = (input().brake > 0 && S.vF > 0.6) || S.burn; if (u.steer) u.steer.rotation.z = S.steer * 2.6;
    for (const t of u.lamps.tail) if (!t.userData.dead) t.material.emissiveIntensity = braking ? 3.2 : 0.8;
    if (u.body.userData.siren) { const ph = (performance.now() / 260) | 0; u.body.userData.siren[0].material.emissiveIntensity = ph % 2 ? 3 : 0.3; u.body.userData.siren[1].material.emissiveIntensity = ph % 2 ? 0.3 : 3; }
  }

  const _cam = new THREE.Vector3(), _look = new THREE.Vector3();
  function chase(dt, snap) {
    const spd = Math.hypot(S.vx, S.vz), vh = spd > 3 ? Math.atan2(S.vx, S.vz) : S.h;
    // behind the car; in a slide it swings part of the way toward where the car is going, so you can see where to catch it.
    // A drag on the screen looks round for a moment, then it settles back.
    S.lookT = Math.max(0, S.lookT - dt); if (S.lookT <= 0) { S.lookYaw = damp(S.lookYaw, 0, 3.5, dt); S.lookPitch = damp(S.lookPitch, 0, 3.5, dt); }
    const rev = S.vF < -2 && spd > 2 ? Math.PI : 0, want = (S.camMode === 1 ? S.h + Math.PI : S.h + rev + wrapA(vh - S.h - rev) * (S.drift ? 0.5 : 0.18)) + S.lookYaw;
    S.camH = snap ? want : S.camH + wrapA(want - S.camH) * (1 - Math.exp(-(S.drift ? 3.2 : 4.6) * dt));
    const sp = car.userData.spec, dist = (sp.L * 0.75 + 3.3) + spd * 0.05, hgt = sp.H + 1.0 + spd * 0.012 + S.lookPitch * 5;
    S.camD = snap ? dist : damp(S.camD, dist, 2.5, dt);
    _cam.set(S.x - Math.sin(S.camH) * S.camD, S.y + hgt, S.z - Math.cos(S.camH) * S.camD);
    if (snap) camera.position.copy(_cam); else camera.position.lerp(_cam, 1 - Math.exp(-10 * dt));
    if (S.shake > 0) { camera.position.x += (Math.random() - 0.5) * S.shake * 0.25; camera.position.y += (Math.random() - 0.5) * S.shake * 0.18; S.shake = Math.max(0, S.shake - dt * 2.5); }
    _look.set(S.x + Math.sin(S.h) * 1.8, S.y + sp.H * 0.75, S.z + Math.cos(S.h) * 1.8); camera.lookAt(_look);
    const fov = 62 + Math.min(16, spd * 0.36); if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = damp(camera.fov, fov, 3, dt); camera.updateProjectionMatrix(); }
  }

  function fx(dt) {
    const u = car.userData, hd = u.hd, s = Math.sin(S.h), c = Math.cos(S.h), rear = u.wheels.filter((w) => !w.front), wheels = S.mode === 'wheels' && !S.air;
    const burn = wheels ? S.burn : 0, smokeR = burn === 1 || (wheels && (S.slip > 0.16 || S.spinR) && Math.abs(S.vF) + Math.abs(S.r) * 3 > 3), smokeF = burn === 2 || (wheels && S.slipF > 0.3 && Math.abs(S.vF) > 8);
    if (smokeR) rear.forEach((w, i) => { const p = w.pivot.position, wx = S.x + p.x * c + p.z * s, wz = S.z - p.x * s + p.z * c; skid(i, wx, wz, S.y); if (Math.random() < dt * (burn ? 55 : 26)) puff(wx - s * 0.2, S.y + 0.15, wz - c * 0.2, burn ? { color: '#e4e4e4', size: 0.45, grow: 2.6, life: 1.7, vy: 0.9, a: 0.42, vx: -s * 2.2 + S.vx * 0.3, vz: -c * 2.2 + S.vz * 0.3, spread: 1.2 } : { color: '#d8d8d8', size: 0.3, grow: 1.5, life: 0.9, vy: 0.5, a: 0.3, vx: S.vx * 0.25, vz: S.vz * 0.25 }); }); else lastSk[0] = lastSk[1] = null;
    if (smokeF && Math.random() < dt * (burn ? 60 : 14)) { const w = u.wheels[Math.random() < 0.5 ? 0 : 1].pivot.position; puff(S.x + w.x * c + w.z * s, S.y + 0.15, S.z - w.x * s + w.z * c, { color: '#d0d0d0', size: 0.25, grow: 1.1, life: 0.7, vy: 0.4, a: 0.22 }); }
    spdEl.textContent = Math.round(Math.hypot(S.vx, S.vz) * 3.6);
    const f = u.hp / hd.hpMax; hpBar.style.width = Math.round(f * 100) + '%'; hpBar.style.background = f > 0.6 ? '#5fd05a' : f > 0.3 ? '#e6c234' : '#e0482e';
    if (au) { const t = au.ctx.currentTime, vF = Math.abs(S.vF), gears = [0, 9, 17, 26, 36, 60]; let g = 1; while (g < 5 && vF > gears[g]) g++; const lo = gears[g - 1], hi = gears[g], thr = u.wreck ? 0 : input().gas;
      const rpm = clamp(0.25 + 0.75 * clamp((vF - lo) / (hi - lo), 0, 1) + (S.spinR && thr ? 0.35 : 0) + (S.burn ? 0.75 : 0), 0.2, 1.3), fq = (38 + rpm * 95) * hd.note * (f < 0.2 ? 0.92 + Math.random() * 0.12 : 1);
      au.o1.frequency.setTargetAtTime(fq, t, 0.05); au.o2.frequency.setTargetAtTime(fq * 0.5, t, 0.05); au.lp.frequency.setTargetAtTime(300 + rpm * 900 + thr * 600, t, 0.08);
      au.master.gain.setTargetAtTime(u.wreck ? 0 : 0.05 + thr * 0.05, t, 0.1); au.sq.gain.setTargetAtTime(wheels && (smokeR || smokeF) ? clamp(0.012 + S.slip * 0.06, 0, 0.045) : 0, t, 0.05);
      const hn = !u.wreck && !anim && (keys.has('KeyH') || touch.horn); au.horn.gain.setTargetAtTime(hn ? 0.07 : 0, t, 0.012); if (hn && !hornOn && hooks.horn) hooks.horn(S.x, S.z, S.h); hornOn = hn; }
  }

  let headLight = null;
  // ---- getting in and out: the driver's door swings, the view glides from where you stood to behind the car, and
  // someone sits at the wheel while it is driven
  const doorJobs = [];
  const swing = (g, to, delay = 0, dur = 0.3) => { if (!g.userData.door || !g.userData.door.length) return; doorJobs.push({ g, to, delay, dur, on: false }); };
  function tickDoors(dt) { for (let i = doorJobs.length - 1; i >= 0; i--) { const j = doorJobs[i]; if ((j.delay -= dt) > 0) continue; if (!j.on) { j.on = true; for (const o of doorJobs) if (o !== j && o.g === j.g && o.on) o.dead = true; } if (j.dead) { doorJobs.splice(i, 1); continue; } const u = j.g.userData; if (u.wreck) { doorJobs.splice(i, 1); continue; } const a0 = u.doorA || 0, st = dt / j.dur, a = Math.abs(j.to - a0) <= st ? j.to : a0 + Math.sign(j.to - a0) * st; u.doorA = a; const e = a * a * (3 - 2 * a); for (const m of u.door) m.rotation.y = -e * 1.12; if (a === j.to) { doorJobs.splice(i, 1); if (j.to === 0 && au) thud(0.12, 420, 0.07); } } }
  // where your head is when you sit at the wheel (world), looking down the bonnet
  const _hp = new THREE.Vector3(), _hq = new THREE.Quaternion(), _e = new THREE.Euler();
  function headAt(g) { const u = g.userData, st = u.seat || { x: u.half.x * 0.45, y: 0.5, z: 0 }; _hp.set(st.x, Math.min(st.y + 0.62, u.spec.H - 0.14), st.z - 0.02); u.body.updateMatrixWorld(true); u.body.localToWorld(_hp); _hq.setFromEuler(_e.set(-0.04, g.rotation.y + Math.PI, 0, 'YXZ')); }
  const _p0 = new THREE.Vector3(), _q0 = new THREE.Quaternion();
  const api = {
    active: false, cars, state: S, rebuild: fileColliders,
    addCar(g, { name = 'car' } = {}) { const u = g.userData; u.driveName = name; u.hd = handlingFor(u.spec.type || 'sedan', u.spec); u.hp = u.hd.hpMax; cars.push(g); u.cols = [];
      for (let i = 0; i < 3; i++) { const c = { type: 'circle', x: 0, z: 0, r: u.half.x * 0.96, car: g, active: true }; colliders.push(c); u.cols.push(c); } api.syncCols(g); return g; },
    adopt(g) { if (!cars.includes(g)) cars.push(g); for (const c of g.userData.cols) if (!colliders.includes(c)) colliders.push(c); api.syncCols(g); },
    syncCols(g) { const u = g.userData, s = Math.sin(g.rotation.y), c = Math.cos(g.rotation.y), W = u.half.x * 0.96; [u.half.zF - W, (u.half.zF + u.half.zR) / 2, u.half.zR + W].forEach((lz, i) => { const k = u.cols[i]; k.x = g.position.x + lz * s; k.z = g.position.z + lz * c; });
      for (const k of u.cols) { for (const l of grid.values()) { const j = l.indexOf(k); if (j >= 0) l.splice(j, 1); } for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const kk = cellKey(Math.floor(k.x / CELL) + i, Math.floor(k.z / CELL) + j); if (!grid.has(kk)) grid.set(kk, []); grid.get(kk).push(k); } } },
    nearest(p) { let best = null, bd = 3.6; for (const g of cars) { if (g.userData.wreck) continue; const d = Math.hypot(p.x - g.position.x, p.z - g.position.z) - g.userData.half.x; if (d < bd) { bd = d; best = g; } } return best; },
    enter(g) { _p0.copy(camera.position); _q0.copy(camera.quaternion); car = g; api.active = true; const d = g.userData.dyn; S.x = g.position.x; S.z = g.position.z; S.h = g.rotation.y; S.vx = d ? d.vx : 0; S.vz = d ? d.vz : 0; if (d) d.vx = d.vz = d.w = 0; S.r = S.steer = 0; S.y = g.position.y; S.drift = 0; S.camMode = 0; S.air = false; S.vy = S.vyG = 0; S.lastG = S.y; S.mode = 'wheels'; S.phi = S.phiV = 0; S.roll = S.rollV = S.pitch = S.pitchV = 0; S.lookYaw = S.lookPitch = 0; S.spinExtra = 0; S.stuckT = 0; S.tipT = 0;
      for (const k of g.userData.cols) k.active = false; g.userData.lamps.head.forEach((h) => { if (!h.userData.dead) h.material.emissiveIntensity = 2.4; });
      if (!headLight) {   // the light the lamps throw on the road: one soft cone a lamp, narrow at the car, wide and fading out ahead, no edges
        const c = document.createElement('canvas'), CW = 128, CH = 256; c.width = CW; c.height = CH; const x = c.getContext('2d'), im = x.createImageData(CW, CH);
        for (let py = 0; py < CH; py++) for (let px = 0; px < CW; px++) { const v = 1 - py / (CH - 1), u = (px / (CW - 1)) * 2 - 1, w = 0.1 + 0.72 * v, lat = Math.exp(-((u / w) ** 2) * 2.6), edge = Math.max(0, 1 - Math.abs(u)) ** 0.6;
          const along = Math.min(1, v / 0.05) * (1 - v) ** 1.7, hot = 1 + 1.3 * Math.exp(-(((v - 0.2) / 0.14) ** 2)), a = Math.min(1, lat * edge * along * hot * 0.75), k = (py * CW + px) * 4; im.data[k] = 255; im.data[k + 1] = 244; im.data[k + 2] = 222; im.data[k + 3] = Math.round(a * 255); }
        x.putImageData(im, 0, 0);
        const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6 }); headLight = new THREE.Group();
        for (const s of [-1, 1]) { const geo = new THREE.PlaneGeometry(7, 17); geo.translate(0, 8.5, 0); const b = new THREE.Mesh(geo, mat); b.rotation.x = Math.PI / 2; b.rotation.z = s * -0.045; b.position.set(s * 0.55, 0.035, -0.1);   /* (turned so the cone runs forward from the lamps) */ headLight.add(b); } }
      g.add(headLight); headLight.position.set(0, 0, g.userData.half.zF); const a = audio(); a?.ctx.resume?.(); chase(0, true);
      if (g.userData.door && g.userData.door.length && !g.userData.wreck) { anim = { kind: 'in', t: 0 }; swing(g, 1, 0, 0.25); swing(g, 0, 0.62); camera.position.copy(_p0); camera.quaternion.copy(_q0); } else anim = null; },
    // get out with the door (standing still, on its wheels); otherwise straight out. `done` does the actual leaving.
    leave(done) { const g = car; if (!g) return; if (anim) { if (anim.kind === 'in') return; return; } if (g.userData.wreck || S.mode !== 'wheels' || Math.hypot(S.vx, S.vz) > 2.5 || !g.userData.door || !g.userData.door.length) { done(); return; } _p0.copy(camera.position); _q0.copy(camera.quaternion); anim = { kind: 'out', t: 0, done }; swing(g, 1, 0.1, 0.25); swing(g, 0, 1.0); },
    // getting out: at speed the car rolls on by itself
    exit() { const g = car; if (!g) return null; api.active = false; anim = null; const u = g.userData, s = Math.sin(S.h), c = Math.cos(S.h);
      if (S.mode === 'wheels') { const d = dyn(g); d.vx = S.vx; d.vz = S.vz; d.w = S.r; } pose(0.016); api.syncCols(g); for (const k of u.cols) k.active = true; if (headLight) g.remove(headLight);
      if (au) { au.master.gain.setTargetAtTime(0, au.ctx.currentTime, 0.1); au.sq.gain.setTargetAtTime(0, au.ctx.currentTime, 0.05); } camera.fov = 62; camera.updateProjectionMatrix(); car = null; touch.steer = touch.gas = touch.brake = touch.hand = touch.left = touch.right = touch.horn = 0; if (au) au.horn.gain.setTargetAtTime(0, au.ctx.currentTime, 0.01); hornOn = false; hud.querySelectorAll('button.on').forEach((b) => b.classList.remove('on'));
      for (const [lx, lz] of [[u.half.x + 0.8, 0.3], [-u.half.x - 0.8, 0.3], [0, u.half.zR - 1.0], [0, u.half.zF + 1.0]]) { const x = S.x + lx * c + lz * s, z = S.z - lx * s + lz * c; if (inArea(x, z)) return { x, z, yaw: S.h + Math.PI }; }
      return { x: S.x + (u.half.x + 0.8) * c, z: S.z - (u.half.x + 0.8) * s, yaw: S.h + Math.PI }; },
    // every frame, driving or not: the other cars, fires, smoke; and the driven car when there is one
    update(dt) { tickOthers(dt); tickParts(dt); tickDoors(dt); if (msgT > 0 && (msgT -= dt) <= 0) msgEl.style.opacity = 0; if (!car) return;
      if (anim) { anim.t += dt; if (anim.kind === 'out' && anim.t > 0.45) { const d = anim.done; anim = null; headAt(car); camera.position.copy(_hp); camera.quaternion.copy(_hq); d(); return; } }
      const inp = input(), n = 4; for (let i = 0; i < n; i++) step(dt / n, inp); pose(dt); chase(dt, !!anim); fx(dt);
      // first person: getting in, your head goes from where you stood down into the seat, the door shuts, and the view
      // draws back to behind the car; getting out, it comes forward into the seat first (then you stand up: see the caller)
      if (anim) { const ease = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); }; headAt(car);
        if (anim.kind === 'in') { if (anim.t < 0.6) { const e = ease(anim.t / 0.6); camera.position.lerpVectors(_p0, _hp, e); camera.position.y -= Math.sin(e * Math.PI) * 0.12; camera.quaternion.slerpQuaternions(_q0, _hq, e); } else { const e = ease((anim.t - 0.6) / 0.55); camera.position.lerpVectors(_hp, camera.position, e); camera.quaternion.slerpQuaternions(_hq, camera.quaternion, e); if (e >= 1) anim = null; } }
        else { const e = ease(anim.t / 0.45); camera.position.lerpVectors(_p0, _hp, e); camera.quaternion.slerpQuaternions(_q0, _hq, e); } }
      if (S.mode === 'tumble' && Math.abs(Math.abs(wrapA(S.phi)) - Math.PI / 2) < 0.2) car.userData.flipped = true; },
    sim(secs, force) { api.force = force; for (let i = 0; i < secs * 60; i++) api.update(1 / 60); api.force = null; },
    hurt, explode, say, input,
    get car() { return car; },
  };
  addEventListener('keydown', (e) => { if (!api.active) return; if (e.code === 'KeyC' && !e.repeat) S.camMode = 1; });
  addEventListener('keyup', (e) => { if (e.code === 'KeyC') S.camMode = 0; });
  return api;
}
